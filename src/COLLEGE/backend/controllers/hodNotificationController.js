const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const FacultyRequest = require("../models/FacultyRequest");
const Notification = require("../models/Notification");
const OutpassRequest = require("../models/OutpassRequest");
const Student = require("../models/Student");
const Suggestion = require("../models/Suggestion");

const notificationSources = {
  FacultyRequest: {
    path: "/hod/faculty-approval",
    type: "APPROVAL",
  },
  Complaint: {
    path: "/hod/complaints",
    type: "REQUEST",
  },
  Suggestion: {
    path: "/hod/suggestions",
    type: "REQUEST",
  },
  OutpassRequest: {
    path: "/hod/outpass",
    type: "REQUEST",
  },
};

const findOrCreateNotification = async (hodId, source) => {
  const filter = {
    recipient: hodId,
    recipientModel: "HOD",
    sourceModel: source.sourceModel,
    sourceId: source.sourceId,
  };

  try {
    return await Notification.findOneAndUpdate(
      filter,
      {
        $setOnInsert: {
          title: source.title,
          message: source.message,
          type: source.type,
          isRead: false,
        },
      },
      { new: true, upsert: true, runValidators: true }
    ).lean();
  } catch (error) {
    if (error.code !== 11000) throw error;
    return Notification.findOne(filter).lean();
  }
};

const getHODNotifications = async (req, res) => {
  const { department, _id: hodId } = req.reviewer;

  try {
    const students = await Student.find({
      branch: department,
      isActive: true,
    })
      .select("_id")
      .lean();
    const studentIds = students.map((student) => student._id);

    const [facultyRequests, complaints, suggestions, outpasses] =
      await Promise.all([
        FacultyRequest.find({ department, status: "PENDING" })
          .select("name facultyId createdAt")
          .sort({ createdAt: -1 })
          .limit(25)
          .lean(),
        Complaint.find({
          department,
          status: { $in: ["PENDING", "UNDER_REVIEW"] },
        })
          .select("subject student createdAt")
          .populate("student", "name rollNumber")
          .sort({ createdAt: -1 })
          .limit(25)
          .lean(),
        Suggestion.find({
          department,
          status: { $in: ["SUBMITTED", "UNDER_REVIEW"] },
        })
          .select("message student createdAt")
          .populate("student", "name rollNumber")
          .sort({ createdAt: -1 })
          .limit(25)
          .lean(),
        studentIds.length
          ? OutpassRequest.find({
              student: { $in: studentIds },
              status: "PENDING",
            })
              .select("reason student createdAt")
              .populate("student", "name rollNumber")
              .sort({ createdAt: -1 })
              .limit(25)
              .lean()
          : [],
      ]);

    const sources = [
      ...facultyRequests.map((request) => ({
        sourceModel: "FacultyRequest",
        sourceId: request._id,
        title: "Faculty approval request",
        message: `${request.name} (${request.facultyId}) is awaiting approval.`,
        type: notificationSources.FacultyRequest.type,
        createdAt: request.createdAt,
      })),
      ...complaints.map((complaint) => ({
        sourceModel: "Complaint",
        sourceId: complaint._id,
        title: "Student complaint",
        message: `${complaint.student?.name || "A student"} submitted: ${complaint.subject}`,
        type: notificationSources.Complaint.type,
        createdAt: complaint.createdAt,
      })),
      ...suggestions.map((suggestion) => ({
        sourceModel: "Suggestion",
        sourceId: suggestion._id,
        title: "Student suggestion",
        message: `${suggestion.student?.name || "A student"} submitted a suggestion: ${suggestion.message}`,
        type: notificationSources.Suggestion.type,
        createdAt: suggestion.createdAt,
      })),
      ...outpasses.map((outpass) => ({
        sourceModel: "OutpassRequest",
        sourceId: outpass._id,
        title: "Outpass approval request",
        message: `${outpass.student?.name || "A student"} requested an outpass: ${outpass.reason}`,
        type: notificationSources.OutpassRequest.type,
        createdAt: outpass.createdAt,
      })),
    ];

    const notifications = await Promise.all(
      sources.map(async (source) => {
        const notification = await findOrCreateNotification(hodId, source);
        return {
          id: String(notification._id),
          title: notification.title,
          text: notification.message,
          read: Boolean(notification.isRead),
          createdAt: notification.createdAt,
          target: notificationSources[source.sourceModel].path,
        };
      })
    );

    notifications.sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt)
    );

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("HOD notification lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load HOD notifications." });
  }
};

const markHODNotificationRead = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Enter a valid notification ID." });
  }

  try {
    const result = await Notification.updateOne(
      {
        _id: req.params.id,
        recipient: req.reviewer._id,
        recipientModel: "HOD",
        sourceModel: { $in: Object.keys(notificationSources) },
      },
      { $set: { isRead: true } }
    );
    if (!result.matchedCount) {
      return res.status(404).json({ message: "HOD notification not found." });
    }
    return res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("HOD notification update failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to update HOD notification." });
  }
};

const markAllHODNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.reviewer._id,
        recipientModel: "HOD",
        sourceModel: { $in: Object.keys(notificationSources) },
        isRead: false,
      },
      { $set: { isRead: true } }
    );
    return res.status(200).json({
      message: "Notifications marked as read.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("HOD notifications update failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to update HOD notifications." });
  }
};

module.exports = {
  getHODNotifications,
  markHODNotificationRead,
  markAllHODNotificationsRead,
};
