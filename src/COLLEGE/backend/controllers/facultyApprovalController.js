const Faculty = require("../models/Faculty");
const FacultyRequest = require("../models/FacultyRequest");
const {
  approveRequest,
  rejectRequest,
  respondToApprovalError,
} = require("../utils/approvalWorkflow");

const getPendingFacultyRequests = async (req, res) => {
  try {
    const requests = await FacultyRequest.find({
      status: "PENDING",
      department: req.reviewer.department,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Pending faculty requests fetched successfully",
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Pending faculty request lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Failed to fetch faculty requests." });
  }
};

const approveFacultyRequest = async (req, res) => {
  try {
    const { request, account } = await approveRequest({
      Request: FacultyRequest,
      Account: Faculty,
      requestId: req.params.id,
      reviewerId: req.reviewer._id,
      requestDepartment: req.reviewer.department,
      accountIdentifier: (facultyRequest) => ({
        facultyId: facultyRequest.facultyId,
      }),
      getAccountData: async (facultyRequest) => ({
        name: facultyRequest.name,
        facultyId: facultyRequest.facultyId,
        email: facultyRequest.email,
        subject: facultyRequest.subject,
        department: facultyRequest.department,
        branch: facultyRequest.branch || "",
        image: facultyRequest.image || "",
        password: facultyRequest.password,
        role: "faculty",
        isActive: true,
      }),
    });

    return res.status(200).json({
      message: "Faculty approved successfully",
      request: {
        id: request._id,
        status: request.status,
        reviewedBy: request.reviewedBy,
        reviewedAt: request.reviewedAt,
      },
      faculty: {
        id: account._id,
        name: account.name,
        facultyId: account.facultyId,
        subject: account.subject,
        department: account.department,
      },
    });
  } catch (error) {
    return respondToApprovalError(res, error, "Faculty approval failed.");
  }
};

const rejectFacultyRequest = async (req, res) => {
  const rejectionReason =
    typeof req.body?.rejectionReason === "string"
      ? req.body.rejectionReason.trim().slice(0, 500)
      : "";

  try {
    const request = await rejectRequest({
      Request: FacultyRequest,
      requestId: req.params.id,
      reviewerId: req.reviewer._id,
      requestDepartment: req.reviewer.department,
      rejectionReason,
    });

    return res.status(200).json({
      message: "Faculty request rejected successfully",
      request: {
        id: request._id,
        name: request.name,
        facultyId: request.facultyId,
        status: request.status,
        reviewedBy: request.reviewedBy,
        reviewedAt: request.reviewedAt,
        rejectionReason: request.rejectionReason,
      },
    });
  } catch (error) {
    return respondToApprovalError(res, error, "Faculty rejection failed.");
  }
};

module.exports = {
  getPendingFacultyRequests,
  approveFacultyRequest,
  rejectFacultyRequest,
};
