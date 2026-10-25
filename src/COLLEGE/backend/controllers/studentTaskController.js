const mongoose = require("mongoose");
const Student = require("../models/Student");
const StudentTask = require("../models/StudentTask");

const taskCategories = ["Assignment", "Exam", "Study", "Personal", "Other"];

const isValidDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const getActiveStudent = (userId) =>
  Student.findOne({ _id: userId, isActive: true }).select("_id");

const serializeTask = (task) => ({
  id: String(task._id),
  title: task.title,
  category: task.category,
  date: task.date,
  time: task.time || "",
  description: task.description || "",
  completed: Boolean(task.completed),
  createdAt: task.createdAt,
});

const getStudentTasks = async (req, res) => {
  try {
    const student = await getActiveStudent(req.user.userId);
    if (!student) {
      return res.status(403).json({ message: "An active student account is required." });
    }

    const tasks = await StudentTask.find({ student: student._id })
      .sort({ date: 1, time: 1, createdAt: 1 })
      .lean();
    return res.status(200).json({ tasks: tasks.map(serializeTask) });
  } catch (error) {
    console.error("Student task lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load your planner tasks." });
  }
};

const createStudentTask = async (req, res) => {
  const { title, category, date, time: rawTime, description: rawDescription } =
    req.body || {};
  const cleanedTitle = typeof title === "string" ? title.trim() : "";
  const cleanedTime = typeof rawTime === "string" ? rawTime.trim() : "";
  const cleanedDescription =
    typeof rawDescription === "string" ? rawDescription.trim() : "";

  if (
    !cleanedTitle ||
    cleanedTitle.length > 160 ||
    !taskCategories.includes(category) ||
    !isValidDate(date) ||
    (rawTime !== undefined && typeof rawTime !== "string") ||
    (cleanedTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(cleanedTime)) ||
    (rawDescription !== undefined && typeof rawDescription !== "string") ||
    cleanedDescription.length > 3000
  ) {
    return res.status(400).json({ message: "Enter valid planner task details." });
  }

  try {
    const student = await getActiveStudent(req.user.userId);
    if (!student) {
      return res.status(403).json({ message: "An active student account is required." });
    }

    const task = await StudentTask.create({
      student: student._id,
      title: cleanedTitle,
      category,
      date,
      time: cleanedTime,
      description: cleanedDescription,
    });
    return res.status(201).json({
      message: "Planner task created successfully.",
      task: serializeTask(task),
    });
  } catch (error) {
    console.error("Student task creation failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to create this planner task." });
  }
};

const setStudentTaskCompletion = async (req, res) => {
  if (
    !mongoose.isValidObjectId(req.params.taskId) ||
    typeof req.body?.completed !== "boolean"
  ) {
    return res.status(400).json({ message: "Enter a valid task completion state." });
  }

  try {
    const student = await getActiveStudent(req.user.userId);
    if (!student) {
      return res.status(403).json({ message: "An active student account is required." });
    }

    const task = await StudentTask.findOneAndUpdate(
      { _id: req.params.taskId, student: student._id },
      { $set: { completed: req.body.completed } },
      { new: true, runValidators: true }
    ).lean();
    if (!task) {
      return res.status(404).json({ message: "Planner task not found." });
    }
    return res.status(200).json({
      message: "Planner task updated successfully.",
      task: serializeTask(task),
    });
  } catch (error) {
    console.error("Student task update failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to update this planner task." });
  }
};

const deleteStudentTask = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.taskId)) {
    return res.status(400).json({ message: "Invalid planner task." });
  }

  try {
    const student = await getActiveStudent(req.user.userId);
    if (!student) {
      return res.status(403).json({ message: "An active student account is required." });
    }

    const task = await StudentTask.findOneAndDelete({
      _id: req.params.taskId,
      student: student._id,
    });
    if (!task) {
      return res.status(404).json({ message: "Planner task not found." });
    }
    return res.status(200).json({ message: "Planner task deleted successfully." });
  } catch (error) {
    console.error("Student task deletion failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to delete this planner task." });
  }
};

module.exports = {
  getStudentTasks,
  createStudentTask,
  setStudentTaskCompletion,
  deleteStudentTask,
};
