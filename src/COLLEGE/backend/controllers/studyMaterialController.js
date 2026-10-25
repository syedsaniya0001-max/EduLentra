const mongoose = require("mongoose");
const StudyMaterial = require("../models/StudyMaterial");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

const ALL_SECTIONS = "*";
const UNASSIGNED_SECTION = "__unassigned__";

const facultyAccount = async (userId) =>
  Faculty.findOne({ _id: userId, isActive: true }).select(
    "_id name department branch subject"
  );

const normalizeMaterialUrl = (value) => {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 2048) {
    return null;
  }
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
};

const matchesSection = (studentSection, materialSection) =>
  materialSection === ALL_SECTIONS ||
  materialSection === (studentSection?.trim() || UNASSIGNED_SECTION);

const serializeMaterial = (material) => {
  const record = typeof material.toObject === "function"
    ? material.toObject()
    : material;
  return {
    ...record,
    id: String(record._id),
    fileSize: "",
    uploadedDate: record.createdAt
      ? new Date(record.createdAt).toLocaleDateString()
      : "",
  };
};

const getFacultyMaterials = async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const subjectFilter =
    typeof req.query.subject === "string" ? req.query.subject.trim() : "All";

  if (search.length > 120 || subjectFilter.length > 120) {
    return res.status(400).json({ message: "The material search is too long." });
  }

  try {
    const faculty = await facultyAccount(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const branch = faculty.branch || faculty.department;
    if (!branch?.trim()) {
      return res.status(409).json({ message: "Your faculty account needs a branch to manage study materials." });
    }
    const filter = { faculty: faculty._id };
    if (subjectFilter !== "All") filter.subject = faculty.subject;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: new RegExp(escapedSearch, "i") },
        { description: new RegExp(escapedSearch, "i") },
      ];
    }
    const [materials, students] = await Promise.all([
      StudyMaterial.find(filter).sort({ createdAt: -1 }).lean(),
      Student.find({ branch, isActive: true }).select("section").lean(),
    ]);
    return res.status(200).json({
      branch,
      subject: faculty.subject || "",
      sections: [...new Set(students.map(
        (student) => student.section?.trim() || UNASSIGNED_SECTION
      ))].sort(),
      materials: materials.map(serializeMaterial),
    });
  } catch (error) {
    console.error("Faculty study material lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load study materials." });
  }
};

const createStudyMaterial = async (req, res) => {
  const {
    title,
    description,
    unit,
    section,
    fileName,
    fileUrl: rawFileUrl,
  } = req.body || {};
  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanDescription = typeof description === "string" ? description.trim() : "";
  const cleanUnit = typeof unit === "string" ? unit.trim() : "";
  const cleanSection = typeof section === "string" ? section.trim() : "";
  const cleanFileName = typeof fileName === "string" ? fileName.trim() : "";
  const fileUrl = normalizeMaterialUrl(rawFileUrl);

  if (
    !cleanTitle ||
    cleanTitle.length > 160 ||
    cleanDescription.length > 3000 ||
    !cleanUnit ||
    cleanUnit.length > 80 ||
    !cleanSection ||
    cleanSection.length > 100 ||
    !cleanFileName ||
    cleanFileName.length > 255 ||
    !fileUrl
  ) {
    return res.status(400).json({
      message: "Enter a valid title, unit, section, file name, and HTTP/HTTPS document link.",
    });
  }

  try {
    const faculty = await facultyAccount(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const branch = faculty.branch || faculty.department;
    if (!branch?.trim() || !faculty.subject?.trim()) {
      return res.status(409).json({
        message: "Your faculty account needs a branch and subject to publish study materials.",
      });
    }

    const sectionFilter = cleanSection === ALL_SECTIONS
      ? {}
      : cleanSection === UNASSIGNED_SECTION
        ? { $or: [{ section: "" }, { section: { $exists: false } }] }
        : { section: cleanSection };
    const studentCount = await Student.countDocuments({
      branch,
      isActive: true,
      ...sectionFilter,
    });
    if (!studentCount) {
      return res.status(400).json({ message: "There are no active students in the selected section." });
    }

    const material = await StudyMaterial.create({
      faculty: faculty._id,
      branch,
      section: cleanSection,
      subject: faculty.subject,
      unit: cleanUnit,
      title: cleanTitle,
      description: cleanDescription,
      fileUrl,
      fileName: cleanFileName,
    });
    return res.status(201).json({
      message: "Study material published successfully.",
      material: serializeMaterial(material),
    });
  } catch (error) {
    console.error("Study material publish failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to publish this study material." });
  }
};

const deleteStudyMaterial = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.materialId)) {
    return res.status(400).json({ message: "Invalid study material." });
  }

  try {
    const faculty = await facultyAccount(req.user.userId);
    if (!faculty) {
      return res.status(403).json({ message: "An active faculty account is required." });
    }
    const material = await StudyMaterial.findOneAndDelete({
      _id: req.params.materialId,
      faculty: faculty._id,
    });
    if (!material) {
      return res.status(404).json({ message: "Study material not found." });
    }
    return res.status(200).json({ message: "Study material deleted." });
  } catch (error) {
    console.error("Study material delete failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to delete this study material." });
  }
};

const getStudentMaterials = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.user.userId,
      isActive: true,
    }).select("_id branch section");
    if (!student) {
      return res.status(403).json({ message: "An active student account is required." });
    }
    const materials = await StudyMaterial.find({
      branch: student.branch,
      section: { $in: [student.section?.trim() || UNASSIGNED_SECTION, ALL_SECTIONS] },
    })
      .populate("faculty", "name")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({
      materials: materials
        .filter((material) => matchesSection(student.section, material.section))
        .map(serializeMaterial),
    });
  } catch (error) {
    console.error("Student study material lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Unable to load study materials." });
  }
};

module.exports = {
  getFacultyMaterials,
  createStudyMaterial,
  deleteStudyMaterial,
  getStudentMaterials,
  normalizeMaterialUrl,
};
