const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("../models/Admin");
const { isValidEmail, normalizeEmail } = require("./emailValidation");

dotenv.config();

const createAdmin = async () => {
  try {
    if (!["development", "test"].includes(process.env.NODE_ENV)) {
      throw new Error(
        "Admin initialization is restricted to NODE_ENV=development or NODE_ENV=test."
      );
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("Set MONGODB_URI to a dedicated development or test database.");
    }
    let databaseName;
    try {
      databaseName = decodeURIComponent(
        new URL(process.env.MONGODB_URI).pathname
      )
        .replace(/^\/+/, "")
        .split("/")[0];
    } catch {
      throw new Error("MONGODB_URI must be a valid MongoDB connection URI.");
    }
    const allowedDatabaseSuffix =
      process.env.NODE_ENV === "test" ? /_test$/i : /_(?:dev|development)$/i;
    if (!allowedDatabaseSuffix.test(databaseName)) {
      throw new Error(
        "Admin initialization requires a database suffix matching NODE_ENV: _test for test, or _dev/_development for development."
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (typeof adminPassword !== "string" || adminPassword.length < 12) {
      throw new Error(
        "Set ADMIN_PASSWORD to a unique value of at least 12 characters."
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const [existingAdmin, adminCount] = await Promise.all([
      Admin.findOne({ username: "admin" }),
      Admin.countDocuments({}),
    ]);

    if (adminCount > 0) {
      console.log("An Admin account already exists; no additional account was created or changed.");
      if (existingAdmin && !existingAdmin.email) {
        console.log(
          "To add its recovery email, sign in through /api/auth/login as Admin and call PUT /api/auth/admin/email with its JWT."
        );
      }
      if (!existingAdmin) {
        console.log(
          "An existing Admin account uses a different username; it was left unchanged."
        );
      }
      process.exit(0);
    }

    const email = normalizeEmail(process.env.ADMIN_EMAIL);
    if (!isValidEmail(email)) {
      throw new Error("Set a valid ADMIN_EMAIL before creating an Admin account.");
    }

    const existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      throw new Error("ADMIN_EMAIL is already assigned to an Admin account.");
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await Admin.create({
      username: "admin",
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully.");
    console.log("Username: admin");

    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exit(1);
  }
};

createAdmin();