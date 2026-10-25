const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const StudentRequest = require("../models/StudentRequest");
const { isValidEmail, normalizeEmail } = require("../utils/emailValidation");

// Student signup request
const signupStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      branch,
      section,
      entryType,
      email,
      image,
      password,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof rollNumber !== "string" ||
      !rollNumber.trim() ||
      typeof branch !== "string" ||
      !branch.trim() ||
      typeof section !== "string" ||
      !section.trim() ||
      typeof entryType !== "string" ||
      !entryType.trim() ||
      typeof password !== "string" ||
      password.length < 8 ||
      !isValidEmail(normalizedEmail)
    ) {
      return res.status(400).json({
        message: "Complete all required fields, enter a valid email, and use a password with at least 8 characters.",
      });
    }

    const normalizedRollNumber = rollNumber.trim();
    if (
      await Student.findOne({ email: normalizedEmail }) ||
      await StudentRequest.findOne({
        email: normalizedEmail,
        status: "PENDING",
      })
    ) {
      return res.status(409).json({
        message: "This email address is already assigned to a student account or request.",
      });
    }

    // Check if student account already exists
    const existingStudent = await Student.findOne({
      rollNumber: normalizedRollNumber,
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Student already exists",
      });
    }

    // Check existing signup request
    const existingRequest = await StudentRequest.findOne({
      rollNumber: normalizedRollNumber,
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return res.status(409).json({
          message: "Request already sent. Please wait for faculty approval.",
        });
      }

      if (existingRequest.status === "APPROVED") {
        return res.status(409).json({
          message: "Student already exists",
        });
      }

      if (existingRequest.status !== "REJECTED") {
        return res.status(409).json({
          message: "This registration request cannot be resubmitted.",
        });
      }
    }

    const requestData = {
      name,
      rollNumber: normalizedRollNumber,
      email: normalizedEmail,
      branch,
      section,
      entryType,
      image: image || "",
      status: "PENDING",
      decision: null,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: "",
      password: await bcrypt.hash(password, 10),
    };
    let studentRequest;

    if (existingRequest?.status === "REJECTED") {
      existingRequest.decisionHistory = existingRequest.decisionHistory || [];
      existingRequest.decisionHistory.push({
        decision: existingRequest.decision || existingRequest.status,
        reviewedBy: existingRequest.reviewedBy,
        reviewedAt: existingRequest.reviewedAt,
        rejectionReason: existingRequest.rejectionReason || "",
      });
      Object.assign(existingRequest, requestData);
      studentRequest = await existingRequest.save();
    } else {
      studentRequest = await StudentRequest.create(requestData);
    }

    res.status(201).json({
      message: "Signup request sent successfully. Please wait for faculty approval.",
      requestId: studentRequest._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A student account or request already exists for these details.",
      });
    }
    res.status(500).json({
      message: "Student signup failed. Please try again later.",
    });
  }
};

module.exports = {
  signupStudent,
};