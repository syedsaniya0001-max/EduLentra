const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const dns = require("dns");

const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");

const validateSeedEnvironment = (env) => {
  if (env.NODE_ENV !== "test" || env.EDULENTRA_ENABLE_SAMPLE_SEED !== "true") {
    throw new Error(
      "Sample seeding requires NODE_ENV=test and EDULENTRA_ENABLE_SAMPLE_SEED=true."
    );
  }

  if (!env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI to a dedicated test database ending in _test.");
  }

  let databaseName;
  try {
    databaseName = decodeURIComponent(new URL(env.MONGODB_URI).pathname)
      .replace(/^\/+/, "")
      .split("/")[0];
  } catch {
    throw new Error("MONGODB_URI must be a valid MongoDB connection URI.");
  }

  if (!/_test$/i.test(databaseName)) {
    throw new Error("Refusing to seed: the MongoDB database name must end in _test.");
  }

  const passwords = [
    env.SAMPLE_STUDENT_PASSWORD,
    env.SAMPLE_FACULTY_PASSWORD,
    env.SAMPLE_HOD_PASSWORD,
    env.SAMPLE_ADMIN_PASSWORD,
  ];
  if (
    passwords.some((password) => typeof password !== "string" || password.length < 12) ||
    new Set(passwords).size !== passwords.length
  ) {
    throw new Error(
      "Set four distinct SAMPLE_*_PASSWORD values, each at least 12 characters long."
    );
  }

  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error("Set JWT_SECRET to a random value of at least 32 characters.");
  }

  return databaseName;
};

const ensureSampleAccount = async (Model, identifierField, accountData, password) => {
  const existing = await Model.findOne({
    [identifierField]: accountData[identifierField],
  });
  if (existing && existing.isSampleAccount !== true) {
    throw new Error(
      `Refusing to change existing ${Model.modelName} account ${accountData[identifierField]}.`
    );
  }

  const emailOwner = await Model.findOne({ email: accountData.email });
  if (
    emailOwner &&
    (!existing || String(emailOwner._id) !== String(existing._id))
  ) {
    throw new Error(
      `Refusing to reuse an email already assigned to another ${Model.modelName} account.`
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  if (existing) {
    existing.set({ ...accountData, password: passwordHash, isActive: true });
    await existing.save();
    return;
  }

  await Model.create({
    ...accountData,
    password: passwordHash,
    isActive: true,
    isSampleAccount: true,
  });
};

const seedSampleAccounts = async (env = process.env) => {
  const databaseName = validateSeedEnvironment(env);
  await mongoose.connect(env.MONGODB_URI);

  try {
    const adminId = "demo-admin";
    const existingSampleAdmin = await Admin.findOne({ username: adminId });
    if (existingSampleAdmin && existingSampleAdmin.isSampleAccount !== true) {
      throw new Error("Refusing to change the existing demo-admin account.");
    }
    const otherAdminCount = await Admin.countDocuments(
      existingSampleAdmin ? { _id: { $ne: existingSampleAdmin._id } } : {}
    );
    if (otherAdminCount !== 0) {
      throw new Error(
        "Refusing to add a sample Admin because another Admin account already exists."
      );
    }

    const accounts = [
      [
        Admin,
        "username",
        {
          username: adminId,
          name: "EduLentra Sample Admin",
          email: "demo.admin@example.test",
          role: "admin",
          isSampleAccount: true,
        },
        env.SAMPLE_ADMIN_PASSWORD,
      ],
      [
        Student,
        "rollNumber",
        {
          name: "EduLentra Sample Student",
          rollNumber: "DEMO-STU-001",
          email: "demo.student@example.test",
          branch: "CSE-AI",
          section: "A",
          entryType: "Day Scholar",
          role: "student",
          isSampleAccount: true,
        },
        env.SAMPLE_STUDENT_PASSWORD,
      ],
      [
        Faculty,
        "facultyId",
        {
          name: "EduLentra Sample Faculty",
          facultyId: "DEMO-FAC-001",
          email: "demo.faculty@example.test",
          subject: "Sample Course",
          department: "CSE-AI",
          branch: "CSE-AI",
          role: "faculty",
          isSampleAccount: true,
        },
        env.SAMPLE_FACULTY_PASSWORD,
      ],
      [
        HOD,
        "hodId",
        {
          name: "EduLentra Sample HOD",
          hodId: "DEMO-HOD-001",
          email: "demo.hod@example.test",
          department: "CSE-AI",
          role: "hod",
          isSampleAccount: true,
        },
        env.SAMPLE_HOD_PASSWORD,
      ],
    ];

    for (const [Model, identifierField, account] of accounts) {
      const existing = await Model.findOne({
        [identifierField]: account[identifierField],
      });
      if (existing && existing.isSampleAccount !== true) {
        throw new Error(
          `Refusing to change existing ${Model.modelName} account ${account[identifierField]}.`
        );
      }

      const emailOwner = await Model.findOne({ email: account.email });
      if (
        emailOwner &&
        (!existing || String(emailOwner._id) !== String(existing._id))
      ) {
        throw new Error(
          `Refusing to reuse an email already assigned to another ${Model.modelName} account.`
        );
      }
    }

    for (const [Model, identifierField, account, password] of accounts) {
      await ensureSampleAccount(Model, identifierField, account, password);
    }

    console.log(
      `Sample Student, Faculty, HOD, and Admin accounts are ready in ${databaseName}.`
    );
    console.log(
      "Identifiers: DEMO-STU-001, DEMO-FAC-001, DEMO-HOD-001, demo-admin."
    );
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  dotenv.config();
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  seedSampleAccounts().catch((error) => {
    console.error(`Sample-account seeding failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  validateSeedEnvironment,
  ensureSampleAccount,
  seedSampleAccounts,
};
