const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const Announcement = require("../models/Announcement");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const Student = require("../models/Student");

const accountModels = {
  admin: { Model: Admin, name: "Admin" },
  student: { Model: Student, name: "Student" },
  faculty: { Model: Faculty, name: "Faculty" },
  hod: { Model: HOD, name: "HOD" },
};

const targetRoles = new Set(["ALL", "STUDENT", "FACULTY", "HOD", "ADMIN"]);
const priorities = new Set(["Normal", "High", "Urgent"]);
const isValidDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
  new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

const isValidAnnouncement = ({
  title,
  message,
  targetRole,
  category,
  priority,
  date,
  publishAt,
  expiresAt,
}) =>
  typeof title === "string" &&
  Boolean(title.trim()) &&
  typeof message === "string" &&
  Boolean(message.trim()) &&
  targetRoles.has(targetRole) &&
  typeof category === "string" &&
  Boolean(category.trim()) &&
  priorities.has(priority) &&
  isValidDate(date) &&
  isValidOptionalDate(publishAt) &&
  isValidOptionalDate(expiresAt) &&
  (!publishAt || !expiresAt || new Date(expiresAt) > new Date(publishAt));

const isValidOptionalDate = (value) =>
  value === null ||
  value === undefined ||
  ((typeof value === "string" || value instanceof Date) &&
    !Number.isNaN(new Date(value).getTime()));

const cleanOptionalString = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const notifyAnnouncementChange = (req) => {
  req.app.get("io").to("authenticated").emit("announcements:changed");
};

const canTargetRole = (role, targetRole) =>
  (role === "admin" && targetRoles.has(targetRole)) ||
  (role === "hod" && ["STUDENT", "FACULTY"].includes(targetRole)) ||
  (role === "faculty" && targetRole === "STUDENT");

const getTargetDepartment = (role, profile) =>
  role === "faculty"
    ? profile.branch || profile.department
    : role === "hod"
      ? profile.department
      : null;

const getDepartmentMatch = (role, department) => {
  if (!department) {
    return [{ targetDepartment: null }];
  }

  if (role !== "student") {
    return [{ targetDepartment: department }];
  }

  const branchPrefixes = department.split("-").map((_, index, parts) =>
    parts.slice(0, index + 1).join("-")
  );
  const departmentPattern = `^(?:${branchPrefixes
    .map((prefix) => prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})$`;

  return [
    {
      targetDepartment: {
        $regex: departmentPattern,
        $options: "i",
      },
    },
  ];
};

const getAudienceFilter = (role, profile) => {
  const recipientRole = role.toUpperCase();
  const department =
    role === "student"
      ? profile.branch
      : role === "faculty" || role === "hod"
        ? profile.department
        : null;
  const scopeConditions = [];

  if (department) {
    const departmentOptions =
      role === "student"
        ? getDepartmentMatch(role, department)
        : [{ targetDepartment: department }];
    scopeConditions.push({ $or: departmentOptions });
  }

  if (role === "student" && profile.branch) {
    scopeConditions.push({
      $or: [
        { targetBranch: null },
        { targetBranch: profile.branch },
      ],
    });
  } else if (role === "faculty" && profile.branch) {
    scopeConditions.push({
      $or: [
        { targetBranch: null },
        { targetBranch: profile.branch },
      ],
    });
  } else {
    scopeConditions.push({ targetBranch: null });
  }

  if (role === "student") {
    scopeConditions.push({
      $or: [
        { targetSection: null },
        { targetSection: profile.section || "" },
      ],
    });
  } else {
    scopeConditions.push({ targetSection: null });
  }

  return {
    $and: [
      { targetRole: { $in: ["ALL", recipientRole] } },
      ...scopeConditions,
    ],
  };
};

const getPublicationWindowFilter = (now) => ({
  isActive: true,
  $and: [
    { $or: [{ publishAt: null }, { publishAt: { $lte: now } }] },
    { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
  ],
});

const loadAccount = async (user) => {
  const account = accountModels[user?.role];
  if (!account) return null;

  const profile = await account.Model.findOne({
    _id: user.userId,
    isActive: true,
  });

  return profile ? { ...account, profile } : null;
};

const getAnnouncements = async (req, res) => {
  try {
    const account = await loadAccount(req.user);
    if (!account) {
      return res.status(403).json({ message: "An active account is required." });
    }

    const publicationFilter = getPublicationWindowFilter(new Date());
    const audienceFilter = getAudienceFilter(req.user.role, account.profile);
    const visibleAudience = {
      isActive: true,
      $and: [...publicationFilter.$and, ...audienceFilter.$and],
    };
    const visibilityFilter = req.user.role === "admin"
      ? {}
      : req.user.role === "student"
        ? visibleAudience
        : {
            $or: [
              {
                createdBy: account.profile._id,
                createdByModel: account.name,
              },
              visibleAudience,
            ],
          };
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    const announcements = await Announcement.find(visibilityFilter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      announcements: announcements.map((announcement) => ({
        ...announcement,
        id: announcement._id.toString(),
        canEdit:
          req.user.role === "admin" ||
          (announcement.createdByModel === account.name &&
            announcement.createdBy.toString() === account.profile._id.toString()),
        canDelete:
          req.user.role === "admin" ||
          (announcement.createdByModel === account.name &&
            announcement.createdBy.toString() === account.profile._id.toString()),
      })),
    });
  } catch (error) {
    console.error("Announcement lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load announcements." });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const account = await loadAccount(req.user);
    if (!account || !["admin", "hod", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "You cannot publish announcements." });
    }

    const {
      title,
      message,
      targetRole,
      category = "General",
      priority = "Normal",
      date = new Date().toISOString().slice(0, 10),
      targetDepartment: requestedTargetDepartment,
      targetBranch,
      targetSection,
      publishAt = null,
      expiresAt = null,
      isActive = true,
    } = req.body || {};

    if (
      !isValidAnnouncement({
        title,
        message,
        targetRole,
        category,
        priority,
        date,
        publishAt,
        expiresAt,
      }) ||
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        message: "Enter valid announcement content, audience, publication state, and dates.",
      });
    }

    if (!canTargetRole(req.user.role, targetRole)) {
      return res.status(403).json({
        message: "You can only target students or faculty in your department.",
      });
    }

    const targetDepartment = getTargetDepartment(req.user.role, account.profile);

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      category: category.trim(),
      priority,
      date,
      targetRole,
      targetDepartment:
        req.user.role === "admin"
          ? cleanOptionalString(requestedTargetDepartment)
          : targetDepartment,
      targetBranch:
        req.user.role === "admin"
          ? cleanOptionalString(targetBranch)
          : req.user.role === "faculty"
            ? cleanOptionalString(account.profile.branch)
            : null,
      targetSection:
        req.user.role === "admin" || req.user.role === "hod"
          ? cleanOptionalString(targetSection)
          : null,
      publishAt: publishAt || null,
      expiresAt: expiresAt || null,
      isActive,
      createdBy: account.profile._id,
      createdByModel: account.name,
      createdByName: account.profile.name || account.profile.username || "",
    });
    notifyAnnouncementChange(req);

    return res.status(201).json({
      announcement: {
        ...announcement.toObject(),
        id: announcement._id.toString(),
        canEdit: true,
        canDelete: true,
      },
    });
  } catch (error) {
    console.error("Announcement creation failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to publish announcement." });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const account = await loadAccount(req.user);
    if (!account || !["admin", "hod", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "You cannot edit announcements." });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid announcement ID." });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    const isOwner =
      announcement.createdByModel === account.name &&
      announcement.createdBy.toString() === account.profile._id.toString();

    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({
        message: "You can only edit announcements you published.",
      });
    }

    const {
      title,
      message,
      targetRole,
      category = announcement.category,
      priority = announcement.priority,
      date = announcement.date,
      targetDepartment,
      targetBranch,
      targetSection,
      publishAt = announcement.publishAt,
      expiresAt = announcement.expiresAt,
      isActive = announcement.isActive,
    } = req.body || {};

    if (
      !isValidAnnouncement({
        title,
        message,
        targetRole,
        category,
        priority,
        date,
        publishAt,
        expiresAt,
      }) ||
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        message: "Enter valid announcement content, audience, publication state, and dates.",
      });
    }

    if (!canTargetRole(req.user.role, targetRole)) {
      return res.status(403).json({
        message: "You can only target students or faculty in your department.",
      });
    }

    const previousExpiry = announcement.expiresAt
      ? new Date(announcement.expiresAt)
      : null;
    const requestedExpiry = expiresAt ? new Date(expiresAt) : null;
    if (
      req.user.role !== "admin" &&
      previousExpiry &&
      (!requestedExpiry || requestedExpiry > previousExpiry)
    ) {
      return res.status(403).json({
        message: "Only an administrator may extend or remove an announcement expiry.",
      });
    }

    announcement.title = title.trim();
    announcement.message = message.trim();
    announcement.targetRole = targetRole;
    announcement.targetDepartment = req.user.role === "admin"
      ? cleanOptionalString(targetDepartment)
      : getTargetDepartment(req.user.role, account.profile);
    announcement.targetBranch = req.user.role === "admin"
      ? cleanOptionalString(targetBranch)
      : req.user.role === "faculty"
        ? cleanOptionalString(account.profile.branch)
        : null;
    announcement.targetSection =
      req.user.role === "admin" || req.user.role === "hod"
        ? cleanOptionalString(targetSection)
        : null;
    announcement.category = category.trim();
    announcement.priority = priority;
    announcement.date = date;
    announcement.publishAt = publishAt || null;
    announcement.expiresAt = expiresAt || null;
    announcement.isActive = isActive;
    await announcement.save();
    notifyAnnouncementChange(req);

    return res.status(200).json({
      announcement: {
        ...announcement.toObject(),
        id: announcement._id.toString(),
        canEdit: true,
        canDelete: true,
      },
    });
  } catch (error) {
    console.error("Announcement update failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to update announcement." });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const account = await loadAccount(req.user);
    if (!account || !["admin", "hod", "faculty"].includes(req.user.role)) {
      return res.status(403).json({ message: "You cannot delete announcements." });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid announcement ID." });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    const isOwner =
      announcement.createdByModel === account.name &&
      announcement.createdBy.toString() === account.profile._id.toString();

    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({
        message: "You can only delete announcements you published.",
      });
    }

    await Announcement.deleteOne({ _id: announcement._id });
    notifyAnnouncementChange(req);
    return res.status(200).json({ message: "Announcement deleted." });
  } catch (error) {
    console.error("Announcement deletion failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to delete announcement." });
  }
};

module.exports = {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
};
