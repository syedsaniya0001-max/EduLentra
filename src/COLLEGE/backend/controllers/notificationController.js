const Admin = require("../models/Admin");
const HODRequest = require("../models/HODRequest");
const Notification = require("../models/Notification");

const findOrCreateRequestNotification = async (adminId, request) => {
  const filter = {
    recipient: adminId,
    recipientModel: "Admin",
    sourceRequest: request._id,
  };
  const update = {
    $setOnInsert: {
      title: "HOD approval request",
      message: `${request.name} (${request.hodId}) requested approval for ${request.department}.`,
      type: "APPROVAL",
      isRead: false,
    },
  };

  try {
    return await Notification.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      runValidators: true,
    }).lean();
  } catch (error) {
    if (error.code !== 11000) throw error;
    return Notification.findOne(filter).lean();
  }
};

const getAdminNotifications = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id");
    if (!admin) {
      return res.status(403).json({ message: "An active Admin account is required." });
    }

    const pendingRequests = await HODRequest.find({ status: "PENDING" })
      .select("_id name hodId department createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const notifications = await Promise.all(
      pendingRequests.map((request) =>
        findOrCreateRequestNotification(admin._id, request)
      )
    );

    return res.status(200).json({
      notifications: notifications.map((notification) => ({
        id: String(notification._id),
        requestId: String(notification.sourceRequest),
        title: notification.title,
        text: notification.message,
        read: Boolean(notification.isRead),
        createdAt: notification.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin notification lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load Admin notifications." });
  }
};

const markAdminNotificationsRead = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id");
    if (!admin) {
      return res.status(403).json({ message: "An active Admin account is required." });
    }

    const pendingRequests = await HODRequest.find({ status: "PENDING" })
      .select("_id")
      .lean();
    const requestIds = pendingRequests.map((request) => request._id);
    let modifiedCount = 0;
    if (requestIds.length > 0) {
      const result = await Notification.updateMany(
        {
          recipient: admin._id,
          recipientModel: "Admin",
          sourceRequest: { $in: requestIds },
          isRead: false,
        },
        { $set: { isRead: true } }
      );
      modifiedCount = result.modifiedCount;
    }

    return res.status(200).json({
      message: "Notifications marked as read.",
      modifiedCount,
    });
  } catch (error) {
    console.error("Admin notifications update failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to update Admin notifications." });
  }
};

module.exports = { getAdminNotifications, markAdminNotificationsRead };
