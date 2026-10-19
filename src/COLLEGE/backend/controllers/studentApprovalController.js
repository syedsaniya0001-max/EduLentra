const Student = require("../models/Student");
const StudentRequest = require("../models/StudentRequest");
const {
  approveRequest,
  rejectRequest,
  respondToApprovalError,
} = require("../utils/approvalWorkflow");

const getPendingStudentRequests = async (req, res) => {
  try {
    const requests = await StudentRequest.find({ status: "PENDING" })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Pending student requests fetched successfully",
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Pending student request lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Failed to fetch student requests." });
  }
};

const approveStudentRequest = async (req, res) => {
  try {
    const { request, account } = await approveRequest({
      Request: StudentRequest,
      Account: Student,
      requestId: req.params.id,
      reviewerId: req.reviewer._id,
      accountIdentifier: (studentRequest) => ({
        rollNumber: studentRequest.rollNumber,
      }),
      getAccountData: async (studentRequest) => ({
        name: studentRequest.name,
        rollNumber: studentRequest.rollNumber,
        email: studentRequest.email,
        branch: studentRequest.branch,
        section: studentRequest.section || "",
        entryType: studentRequest.entryType,
        image: studentRequest.image || "",
        password: studentRequest.password,
        role: "student",
        isActive: true,
      }),
    });

    return res.status(200).json({
      message: "Student approved successfully",
      request: {
        id: request._id,
        status: request.status,
        reviewedBy: request.reviewedBy,
        reviewedAt: request.reviewedAt,
      },
      student: {
        id: account._id,
        name: account.name,
        rollNumber: account.rollNumber,
        branch: account.branch,
        entryType: account.entryType,
      },
    });
  } catch (error) {
    return respondToApprovalError(res, error, "Student approval failed.");
  }
};

const rejectStudentRequest = async (req, res) => {
  const rejectionReason =
    typeof req.body?.rejectionReason === "string"
      ? req.body.rejectionReason.trim().slice(0, 500)
      : "";

  try {
    const request = await rejectRequest({
      Request: StudentRequest,
      requestId: req.params.id,
      reviewerId: req.reviewer._id,
      rejectionReason,
    });

    return res.status(200).json({
      message: "Student request rejected successfully",
      request: {
        id: request._id,
        name: request.name,
        rollNumber: request.rollNumber,
        status: request.status,
        reviewedBy: request.reviewedBy,
        reviewedAt: request.reviewedAt,
        rejectionReason: request.rejectionReason,
      },
    });
  } catch (error) {
    return respondToApprovalError(res, error, "Student rejection failed.");
  }
};

module.exports = {
  getPendingStudentRequests,
  approveStudentRequest,
  rejectStudentRequest,
};
