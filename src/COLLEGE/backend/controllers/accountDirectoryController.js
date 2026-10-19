const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getStudentDirectory = async (req, res) => {
  try {
    const filter = { isActive: true };
    const branch = typeof req.query.branch === "string" ? req.query.branch.trim() : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    if (req.user.role === "hod") {
      filter.branch = req.reviewer.department;
    } else if (branch && branch !== "All") {
      filter.branch = branch;
    }

    if (search) {
      const expression = new RegExp(escapeRegExp(search), "i");
      filter.$or = [
        { name: expression },
        { rollNumber: expression },
        { email: expression },
      ];
    }

    const students = await Student.find(filter)
      .select("_id name rollNumber email branch section entryType isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ count: students.length, students });
  } catch (error) {
    console.error("Student directory lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load student accounts." });
  }
};

const getFacultyDirectory = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.user.role === "hod") {
      filter.department = req.reviewer.department;
    }

    const faculty = await Faculty.find(filter)
      .select("_id name facultyId email subject department isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ count: faculty.length, faculty });
  } catch (error) {
    console.error("Faculty directory lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load faculty accounts." });
  }
};

const getHODDirectory = async (req, res) => {
  try {
    const hods = await HOD.find({ isActive: true })
      .select("_id name hodId email department isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ count: hods.length, hods });
  } catch (error) {
    console.error("HOD directory lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load HOD accounts." });
  }
};

module.exports = {
  getStudentDirectory,
  getFacultyDirectory,
  getHODDirectory,
};
