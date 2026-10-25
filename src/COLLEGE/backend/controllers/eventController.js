const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const Event = require("../models/Event");
const Student = require("../models/Student");

const eventCategories = ["Academic", "Achievement", "Cultural", "Sports", "Other"];

const validDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
  new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

const serializeEvent = (event) => ({
  id: String(event._id || event.id),
  title: event.title,
  category: event.category || "Other",
  date: new Date(event.date).toISOString().slice(0, 10),
  location: event.venue || event.location || "",
  description: event.description || "",
});

const getEvents = async (req, res) => {
  try {
    let filter = { isActive: true };
    if (req.user.role === "student") {
      const student = await Student.findOne({
        _id: req.user.userId,
        isActive: true,
      }).select("_id");
      if (!student) {
        return res.status(403).json({ message: "An active student account is required." });
      }
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);
      filter.date = { $gte: startOfToday };
    } else if (req.user.role === "admin") {
      const admin = await Admin.findOne({
        _id: req.user.userId,
        isActive: true,
      }).select("_id");
      if (!admin) {
        return res.status(403).json({ message: "An active Admin account is required." });
      }
    } else {
      return res.status(403).json({ message: "Access denied." });
    }

    const events = await Event.find(filter).sort({ date: 1, createdAt: -1 }).lean();
    return res.status(200).json({ events: events.map(serializeEvent) });
  } catch (error) {
    console.error("Event lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load campus events." });
  }
};

const createEvent = async (req, res) => {
  const { title, category, date, location, description } = req.body || {};
  const cleanedTitle = typeof title === "string" ? title.trim() : "";
  const cleanedLocation = typeof location === "string" ? location.trim() : "";
  const cleanedDescription =
    typeof description === "string" ? description.trim() : "";

  if (
    !cleanedTitle ||
    cleanedTitle.length > 160 ||
    !eventCategories.includes(category) ||
    !validDate(date) ||
    !cleanedLocation ||
    cleanedLocation.length > 160 ||
    !cleanedDescription ||
    cleanedDescription.length > 5000
  ) {
    return res.status(400).json({ message: "Enter valid event details." });
  }

  try {
    const admin = await Admin.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id");
    if (!admin) {
      return res.status(403).json({ message: "An active Admin account is required." });
    }

    const event = await Event.create({
      title: cleanedTitle,
      category,
      date: new Date(`${date}T00:00:00.000Z`),
      venue: cleanedLocation,
      description: cleanedDescription,
      createdBy: admin._id,
      createdByModel: "Admin",
    });
    return res.status(201).json({
      message: "Event published successfully.",
      event: serializeEvent(event),
    });
  } catch (error) {
    console.error("Event creation failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to publish this event." });
  }
};

const deleteEvent = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid event." });
  }

  try {
    const admin = await Admin.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id");
    if (!admin) {
      return res.status(403).json({ message: "An active Admin account is required." });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.status(200).json({ message: "Event removed." });
  } catch (error) {
    console.error("Event deletion failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to remove this event." });
  }
};

module.exports = { getEvents, createEvent, deleteEvent };
