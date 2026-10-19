const { createHash, randomBytes } = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const PasswordReset = require("../models/PasswordReset");

const PASSWORD_RESET_TTL_MS = 20 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const roleModels = {
  admin: { model: Admin, modelName: "Admin" },
  student: { model: Student, modelName: "Student" },
  faculty: { model: Faculty, modelName: "Faculty" },
  hod: { model: HOD, modelName: "HOD" },
};

const requiredMailSettings = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "FRONTEND_BASE_URL",
];

const getMissingMailSettings = () =>
  requiredMailSettings.filter((setting) => !process.env[setting]);

const getInvalidMailSettings = () => {
  const invalidSettings = [];
  const port = Number(process.env.SMTP_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    invalidSettings.push("SMTP_PORT");
  }

  if (
    process.env.SMTP_SECURE !== undefined &&
    !["true", "false"].includes(process.env.SMTP_SECURE.toLowerCase())
  ) {
    invalidSettings.push("SMTP_SECURE");
  }

  try {
    const frontendUrl = new URL(process.env.FRONTEND_BASE_URL);
    if (!["http:", "https:"].includes(frontendUrl.protocol)) {
      invalidSettings.push("FRONTEND_BASE_URL");
    }
  } catch {
    invalidSettings.push("FRONTEND_BASE_URL");
  }

  return invalidSettings;
};

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure:
      process.env.SMTP_SECURE === undefined
        ? Number(process.env.SMTP_PORT) === 465
        : process.env.SMTP_SECURE.toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const hashToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const escapeHtml = (value = "") =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const createResetUrl = (token, role) => {
  const frontendBase = process.env.FRONTEND_BASE_URL.replace(/\/+$/, "");
  const resetUrl = new URL("reset-password", `${frontendBase}/`);
  resetUrl.searchParams.set("token", token);
  resetUrl.searchParams.set("role", role);
  return resetUrl.toString();
};

const sendResetEmail = async (transporter, user, role, token) => {
  const resetUrl = createResetUrl(token, role);
  const plainGreeting = user.name ? `Hello ${user.name},` : "Hello,";
  const greeting = user.name ? `Hello ${escapeHtml(user.name)},` : "Hello,";

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: "Reset your EduLentra password",
    text: [
      plainGreeting,
      "",
      "We received a request to reset your EduLentra password.",
      `Use this link within 20 minutes: ${resetUrl}`,
      "",
      "If you did not request this reset, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
        <h1 style="color:#1e3a8a">EduLentra</h1>
        <p>${greeting}</p>
        <p>We received a request to reset your EduLentra password.</p>
        <p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p>
        <p>This link expires in 20 minutes. If you did not request this reset,
        you can ignore this email.</p>
      </div>`,
  });
};

const requestPasswordReset = async (req, res) => {
  const missingSettings = getMissingMailSettings();
  if (missingSettings.length) {
    return res.status(503).json({
      message: `Password reset email is not configured. Set: ${missingSettings.join(", ")}.`,
    });
  }

  const invalidSettings = getInvalidMailSettings();
  if (invalidSettings.length) {
    return res.status(503).json({
      message: `Password reset email configuration is invalid. Check: ${invalidSettings.join(", ")}.`,
    });
  }

  const { email, role } = req.body || {};
  const roleEntry = Object.hasOwn(roleModels, role) ? roleModels[role] : null;
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!roleEntry || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({
      message: "Enter a valid email address and select a valid account role.",
    });
  }

  const transporter = getTransporter();
  try {
    await transporter.verify();
  } catch (error) {
    console.error("Password reset email service unavailable:", error.code || error.name);
    return res.status(503).json({
      message: "Password reset email service is temporarily unavailable. Please try again later.",
    });
  }

  try {
    const user = await roleEntry.model
      .findOne({ email: normalizedEmail, isActive: true })
      .select("_id name email");

    if (user) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);

      await PasswordReset.deleteMany({
        userId: user._id,
        userModel: roleEntry.modelName,
      });
      await PasswordReset.create({
        userId: user._id,
        userModel: roleEntry.modelName,
        token: tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      });

      try {
        await sendResetEmail(transporter, user, role, token);
      } catch (error) {
        await PasswordReset.deleteOne({ token: tokenHash });
        console.error("Password reset email delivery failed:", error.code || error.name);
      }
    }

    return res.status(202).json({
      message: "If an active account matches that email and role, a reset link will be sent if delivery is available.",
    });
  } catch (error) {
    console.error("Password reset request failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to process the password reset request. Please try again later.",
    });
  } finally {
    transporter.close();
  }
};

const resetPassword = async (req, res) => {
  const { role, token, password, confirmPassword } = req.body || {};
  const roleEntry = Object.hasOwn(roleModels, role) ? roleModels[role] : null;

  if (!roleEntry) {
    return res.status(400).json({ message: "Invalid account role." });
  }

  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/i.test(token)
  ) {
    return res.status(400).json({
      message: "This reset link is invalid, expired, or already used.",
    });
  }

  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters and no more than 72 UTF-8 bytes.`,
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    const resetRecord = await PasswordReset.findOneAndDelete({
      userModel: roleEntry.modelName,
      token: hashToken(token),
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({
        message: "This reset link is invalid, expired, or already used.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const updatedUser = await roleEntry.model.findOneAndUpdate(
      { _id: resetRecord.userId, isActive: true },
      { $set: { password: passwordHash } },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedUser) {
      return res.status(400).json({
        message: "This reset link is invalid, expired, or already used.",
      });
    }

    await PasswordReset.deleteMany({
      userId: resetRecord.userId,
      userModel: roleEntry.modelName,
    });

    return res.status(200).json({
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Password reset failed:", error.name || "Error");
    return res.status(500).json({
      message: "Unable to reset the password. Please request a new reset link.",
    });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
