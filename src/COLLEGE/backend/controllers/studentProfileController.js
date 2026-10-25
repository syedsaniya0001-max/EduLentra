const Student = require("../models/Student");

const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.user.userId,
      isActive: true,
    })
      .select("_id name rollNumber email branch section entryType image createdAt")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    return res.status(200).json({ student });
  } catch (error) {
    console.error("Student profile lookup failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to load your student profile.",
    });
  }
};

module.exports = { getStudentProfile };
