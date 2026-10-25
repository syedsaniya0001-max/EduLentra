const mongoose = require("mongoose");
const Faculty = require("../models/Faculty");
const FacultyTimetable = require("../models/FacultyTimetable");
const Student = require("../models/Student");

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const activeFaculty = async (userId) =>
  Faculty.findOne({ _id: userId, isActive: true }).select(
    "_id branch department subject"
  );

const validateEntry = (body) => {
  const day = typeof body?.day === "string" ? body.day.trim() : "";
  const section = typeof body?.section === "string" ? body.section.trim() : "";
  const startTime =
    typeof body?.startTime === "string" ? body.startTime.trim() : "";
  const endTime = typeof body?.endTime === "string" ? body.endTime.trim() : "";
  const room = typeof body?.room === "string" ? body.room.trim() : "";

  if (
    !DAYS.includes(day) ||
    !section ||
    section.length > 100 ||
    !TIME_PATTERN.test(startTime) ||
    !TIME_PATTERN.test(endTime) ||
    startTime >= endTime ||
    room.length > 80
  ) {
    return null;
  }
  return { day, section, startTime, endTime, room };
};

const findConflicts = async (facultyId, branch, entry, excludeId) => {
  const overlap = {
    day: entry.day,
    startTime: { $lt: entry.endTime },
    endTime: { $gt: entry.startTime },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  };
  const [facultyConflict, sectionConflict, roomConflict] = await Promise.all([
    FacultyTimetable.findOne({ ...overlap, faculty: facultyId }).select("_id"),
    FacultyTimetable.findOne({
      ...overlap,
      branch,
      section: entry.section,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select("_id"),
    entry.room
      ? FacultyTimetable.findOne({
          ...overlap,
          branch,
          room: { $regex: `^${entry.room.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
          ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        }).select("_id")
      : null,
  ]);
  return {
    facultyConflict: Boolean(facultyConflict),
    classConflict: Boolean(sectionConflict),
    roomConflict: Boolean(roomConflict),
  };
};

const getFacultyTimetable = async (req, res) => {
  try {
    const faculty = await activeFaculty(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const branch = faculty.branch || faculty.department;
    const [schedule, students] = await Promise.all([
      FacultyTimetable.find({ faculty: faculty._id })
        .sort({ day: 1, startTime: 1 })
        .lean(),
      Student.find({ branch, isActive: true }).select("section").lean(),
    ]);
    return res.status(200).json({
      branch,
      subject: faculty.subject,
      sections: [...new Set(
        students.map((student) => student.section?.trim()).filter(Boolean)
      )].sort(),
      timetable: schedule,
    });
  } catch (error) {
    console.error("Faculty timetable lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load your timetable." });
  }
};

const createFacultyTimetableEntry = async (req, res) => {
  const entry = validateEntry(req.body);
  if (!entry) {
    return res.status(400).json({ message: "Enter a valid day, section, time range, and room." });
  }

  try {
    const faculty = await activeFaculty(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const branch = faculty.branch || faculty.department;
    if (!branch?.trim() || !faculty.subject?.trim()) {
      return res.status(409).json({
        message: "Your faculty account needs a branch and subject to manage the timetable.",
      });
    }

    const sectionExists = await Student.exists({
      branch,
      section: entry.section,
      isActive: true,
    });
    if (!sectionExists) {
      return res.status(400).json({
        message: "Select a section that has active students in your branch.",
      });
    }

    const conflicts = await findConflicts(faculty._id, branch, entry);
    const conflictMessage = getConflictMessage(conflicts);
    if (conflictMessage) return res.status(409).json({ message: conflictMessage });

    const timetableEntry = await FacultyTimetable.create({
      ...entry,
      faculty: faculty._id,
      branch,
      subject: faculty.subject,
    });
    return res.status(201).json({
      message: "Timetable entry added.",
      entry: timetableEntry,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This timetable entry conflicts with an existing class." });
    }
    console.error("Faculty timetable creation failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to add the timetable entry." });
  }
};

const updateFacultyTimetableEntry = async (req, res) => {
  const entry = validateEntry(req.body);
  if (!mongoose.isValidObjectId(req.params.entryId) || !entry) {
    return res.status(400).json({ message: "Enter a valid timetable entry." });
  }

  try {
    const faculty = await activeFaculty(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const branch = faculty.branch || faculty.department;
    const existing = await FacultyTimetable.findOne({
      _id: req.params.entryId,
      faculty: faculty._id,
    });
    if (!existing) {
      return res.status(404).json({ message: "Timetable entry not found." });
    }

    const sectionExists = await Student.exists({
      branch,
      section: entry.section,
      isActive: true,
    });
    if (!sectionExists) {
      return res.status(400).json({
        message: "Select a section that has active students in your branch.",
      });
    }

    const conflicts = await findConflicts(
      faculty._id,
      branch,
      entry,
      existing._id
    );
    const conflictMessage = getConflictMessage(conflicts);
    if (conflictMessage) return res.status(409).json({ message: conflictMessage });

    Object.assign(existing, entry);
    await existing.save();
    return res.status(200).json({
      message: "Timetable entry updated.",
      entry: existing,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This timetable entry conflicts with an existing class." });
    }
    console.error("Faculty timetable update failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to update the timetable entry." });
  }
};

const deleteFacultyTimetableEntry = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.entryId)) {
    return res.status(400).json({ message: "Enter a valid timetable entry ID." });
  }

  try {
    const faculty = await activeFaculty(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const result = await FacultyTimetable.deleteOne({
      _id: req.params.entryId,
      faculty: faculty._id,
    });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Timetable entry not found." });
    }
    return res.status(200).json({ message: "Timetable entry deleted." });
  } catch (error) {
    console.error("Faculty timetable deletion failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to delete the timetable entry." });
  }
};

const getConflictMessage = ({ facultyConflict, classConflict, roomConflict }) => {
  if (facultyConflict) {
    return "This class overlaps another entry in your timetable.";
  }
  if (classConflict) {
    return "Another faculty member already scheduled this section at that time.";
  }
  if (roomConflict) {
    return "That room is already booked for this time.";
  }
  return "";
};

module.exports = {
  getFacultyTimetable,
  createFacultyTimetableEntry,
  updateFacultyTimetableEntry,
  deleteFacultyTimetableEntry,
};
