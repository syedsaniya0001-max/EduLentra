const HOD = require("../models/HOD");
const HODRequest = require("../models/HODRequest");
const { isValidEmail, normalizeEmail } = require("../utils/emailValidation");

const updateHODProfile = async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = normalizeEmail(req.body?.email);

  if (name.length < 2 || name.length > 100 || !isValidEmail(email)) {
    return res.status(400).json({
      message: "Enter a name between 2 and 100 characters and a valid email address.",
    });
  }

  try {
    const hod = await HOD.findOne({
      _id: req.user.userId,
      isActive: true,
    });
    if (!hod) {
      return res.status(404).json({ message: "Active HOD account not found." });
    }

    const [existingHOD, pendingRequest] = await Promise.all([
      HOD.findOne({ email, _id: { $ne: hod._id } }).select("_id"),
      HODRequest.findOne({
        email,
        status: "PENDING",
      }).select("_id"),
    ]);
    if (existingHOD || pendingRequest) {
      return res.status(409).json({
        message: "This email address is already assigned to another HOD account or request.",
      });
    }

    hod.name = name;
    hod.email = email;
    await hod.save();

    return res.status(200).json({
      message: "HOD profile updated successfully.",
      user: {
        name: hod.name,
        username: hod.hodId,
        email: hod.email,
        department: hod.department,
      },
    });
  } catch (error) {
    console.error("HOD profile update failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to update your HOD profile. Please try again later.",
    });
  }
};

module.exports = { updateHODProfile };
