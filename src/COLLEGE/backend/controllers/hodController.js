const bcrypt = require("bcryptjs");
const HOD = require("../models/HOD");
const HODRequest = require("../models/HODRequest");
const { isValidEmail, normalizeEmail } = require("../utils/emailValidation");

// HOD signup request
const signupHOD = async (req, res) => {
  try {
    const {
      name,
      hodId,
      email,
      department,
      image,
      password,
    } = req.body;

    const normalizedEmail = normalizeEmail(email);
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof hodId !== "string" ||
      !hodId.trim() ||
      typeof department !== "string" ||
      !department.trim() ||
      typeof password !== "string" ||
      password.length < 8 ||
      !isValidEmail(normalizedEmail)
    ) {
      return res.status(400).json({
        message: "Complete all required fields, enter a valid email, and use a password with at least 8 characters.",
      });
    }

    const normalizedHodId = hodId.trim();
    if (
      await HOD.findOne({ email: normalizedEmail }) ||
      await HODRequest.findOne({
        email: normalizedEmail,
        status: "PENDING",
      })
    ) {
      return res.status(409).json({
        message: "This email address is already assigned to an HOD account or request.",
      });
    }

    const existingHOD = await HOD.findOne({
      hodId: normalizedHodId,
    });

    if (existingHOD) {
      return res.status(409).json({
        message: "HOD already exists",
      });
    }

    const existingRequest = await HODRequest.findOne({
      hodId: normalizedHodId,
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return res.status(409).json({
          message:
            "Request already sent. Please wait for Admin approval.",
        });
      }

      if (existingRequest.status === "APPROVED") {
        return res.status(409).json({
          message: "HOD already exists",
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
      hodId: normalizedHodId,
      email: normalizedEmail,
      department,
      image: image || "",
      status: "PENDING",
      decision: null,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: "",
      password: await bcrypt.hash(password, 10),
    };
    let hodRequest;

    if (existingRequest?.status === "REJECTED") {
      existingRequest.decisionHistory = existingRequest.decisionHistory || [];
      existingRequest.decisionHistory.push({
        decision: existingRequest.decision || existingRequest.status,
        reviewedBy: existingRequest.reviewedBy,
        reviewedAt: existingRequest.reviewedAt,
        rejectionReason: existingRequest.rejectionReason || "",
      });
      Object.assign(existingRequest, requestData);
      hodRequest = await existingRequest.save();
    } else {
      hodRequest = await HODRequest.create(requestData);
    }

    res.status(201).json({
      message:
        "HOD signup request sent successfully. Please wait for Admin approval.",
      requestId: hodRequest._id,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An HOD account or request already exists for these details.",
      });
    }
    res.status(500).json({
      message: "HOD signup failed. Please try again later.",
    });
  }
};

module.exports = {
  signupHOD,
};