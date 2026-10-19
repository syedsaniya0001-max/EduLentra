const bcrypt = require("bcryptjs");
const Faculty = require("../models/Faculty");
const FacultyRequest = require("../models/FacultyRequest");
const { isValidEmail, normalizeEmail } = require("../utils/emailValidation");

// Faculty signup request
const signupFaculty = async (req, res) => {
  try {
    const {
      name,
      facultyId,
      email,
      subject,
      department,
      branch,
      image,
      password,
    } = req.body;

    // Validate required fields
    const normalizedEmail = normalizeEmail(email);
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof facultyId !== "string" ||
      !facultyId.trim() ||
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof department !== "string" ||
      !department.trim() ||
      typeof branch !== "string" ||
      !branch.trim() ||
      typeof password !== "string" ||
      password.length < 8 ||
      !isValidEmail(normalizedEmail)
    ) {
      return res.status(400).json({
        message: "Complete all required fields, enter a valid email, and use a password with at least 8 characters.",
      });
    }

    const normalizedFacultyId = facultyId.trim();
    if (
      await Faculty.findOne({ email: normalizedEmail }) ||
      await FacultyRequest.findOne({
        email: normalizedEmail,
        status: "PENDING",
      })
    ) {
      return res.status(409).json({
        message: "This email address is already assigned to a faculty account or request.",
      });
    }

    // Check if Faculty account already exists
    const existingFaculty = await Faculty.findOne({
      facultyId: normalizedFacultyId,
    });

    if (existingFaculty) {
      return res.status(409).json({
        message: "Faculty already exists",
      });
    }

    // Check if a request already exists
    const existingRequest = await FacultyRequest.findOne({
      facultyId: normalizedFacultyId,
    });

    if (existingRequest) {
      // Pending request
      if (existingRequest.status === "PENDING") {
        return res.status(409).json({
          message:
            "Request already sent. Please wait for HOD approval.",
        });
      }

      // Already approved
      if (existingRequest.status === "APPROVED") {
        return res.status(409).json({
          message: "Faculty already exists",
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
      facultyId: normalizedFacultyId,
      email: normalizedEmail,
      subject,
      department,
      branch: branch.trim(),
      image: image || "",
      status: "PENDING",
      decision: null,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: "",
      password: await bcrypt.hash(password, 10),
    };
    let facultyRequest;

    if (existingRequest?.status === "REJECTED") {
      existingRequest.decisionHistory = existingRequest.decisionHistory || [];
      existingRequest.decisionHistory.push({
        decision: existingRequest.decision || existingRequest.status,
        reviewedBy: existingRequest.reviewedBy,
        reviewedAt: existingRequest.reviewedAt,
        rejectionReason: existingRequest.rejectionReason || "",
      });
      Object.assign(existingRequest, requestData);
      facultyRequest = await existingRequest.save();
    } else {
      facultyRequest = await FacultyRequest.create(requestData);
    }

    res.status(201).json({
      message:
        "Faculty signup request sent successfully. Please wait for HOD approval.",
      requestId: facultyRequest._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A faculty account or request already exists for these details.",
      });
    }
    res.status(500).json({
      message: "Faculty signup failed. Please try again later.",
    });
  }
};

module.exports = {
  signupFaculty,
};