const bcrypt = require("bcryptjs");
const Faculty = require("../models/Faculty");

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const profileFields = [
  "phone",
  "office",
  "designation",
  "qualification",
  "experience",
];

const cleanProfileField = (value, maximumLength) => {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length <= maximumLength ? cleaned : null;
};

const serializeFacultyProfile = (faculty) => ({
  id: faculty.facultyId,
  username: faculty.facultyId,
  name: faculty.name,
  email: faculty.email || "",
  department: faculty.department,
  branch: faculty.branch || "",
  subject: faculty.subject,
  image: faculty.image || "",
  phone: faculty.phone || "",
  office: faculty.office || "",
  designation: faculty.designation || "",
  qualification: faculty.qualification || "",
  experience: faculty.experience || "",
});

const getFacultyProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      _id: req.user.userId,
      isActive: true,
    });
    if (!faculty) {
      return res.status(404).json({ message: "Active faculty account not found." });
    }
    return res.status(200).json({ faculty: serializeFacultyProfile(faculty) });
  } catch (error) {
    console.error("Faculty profile lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load your faculty profile." });
  }
};

const updateFacultyProfile = async (req, res) => {
  const name =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({
      message: "Enter a name between 2 and 100 characters.",
    });
  }

  const limits = {
    phone: 30,
    office: 120,
    designation: 100,
    qualification: 120,
    experience: 80,
  };
  const updates = {};
  for (const field of profileFields) {
    if (req.body[field] === undefined) continue;
    const value = cleanProfileField(req.body[field], limits[field]);
    if (value === null) {
      return res.status(400).json({
        message: `Enter a valid ${field} value (up to ${limits[field]} characters).`,
      });
    }
    updates[field] = value;
  }

  if (
    updates.phone &&
    !/^[0-9+().\-\s]{7,30}$/.test(updates.phone)
  ) {
    return res.status(400).json({
      message: "Enter a valid contact phone number.",
    });
  }

  try {
    const faculty = await Faculty.findOne({
      _id: req.user.userId,
      isActive: true,
    });
    if (!faculty) {
      return res.status(404).json({ message: "Active faculty account not found." });
    }

    faculty.name = name;
    Object.assign(faculty, updates);
    await faculty.save();

    return res.status(200).json({
      message: "Faculty profile updated successfully.",
      faculty: serializeFacultyProfile(faculty),
    });
  } catch (error) {
    console.error("Faculty profile update failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to update your faculty profile. Please try again later.",
    });
  }
};

const changeFacultyPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof currentPassword !== "string" || !currentPassword) {
    return res.status(400).json({ message: "Enter your current password." });
  }
  if (
    typeof newPassword !== "string" ||
    newPassword.length < MIN_PASSWORD_LENGTH ||
    newPassword.length > MAX_PASSWORD_LENGTH ||
    Buffer.byteLength(newPassword, "utf8") > 72
  ) {
    return res.status(400).json({
      message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters and no more than 72 UTF-8 bytes.`,
    });
  }

  try {
    const faculty = await Faculty.findOne({
      _id: req.user.userId,
      isActive: true,
    });
    if (!faculty) {
      return res.status(404).json({ message: "Active faculty account not found." });
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      faculty.password
    );
    if (!currentPasswordMatches) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    faculty.password = await bcrypt.hash(newPassword, 10);
    await faculty.save();
    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Faculty password change failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to change your password. Please try again later.",
    });
  }
};

module.exports = {
  changeFacultyPassword,
  getFacultyProfile,
  updateFacultyProfile,
};
