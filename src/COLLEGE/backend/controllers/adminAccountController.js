const Admin = require("../models/Admin");
const { isValidEmail, normalizeEmail } = require("../utils/emailValidation");

const updateAdminEmail = async (req, res) => {
  const email = normalizeEmail(req.body?.email);

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  try {
    const admin = await Admin.findOne({
      _id: req.user.userId,
      isActive: true,
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin account not found." });
    }

    const existingEmail = await Admin.findOne({
      email,
      _id: { $ne: admin._id },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "This email address is already assigned to another Admin account.",
      });
    }

    admin.email = email;
    await admin.save();

    return res.status(200).json({ message: "Admin recovery email updated successfully." });
  } catch (error) {
    console.error("Admin recovery email update failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to update the Admin recovery email. Please try again later.",
    });
  }
};

module.exports = {
  updateAdminEmail,
};
