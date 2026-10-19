const HOD = require("../models/HOD");
const HODRequest = require("../models/HODRequest");
const {
  approveRequest,
  rejectRequest,
  respondToApprovalError,
} = require("../utils/approvalWorkflow");

const getPendingHODRequests = async (req, res) => {
  try {
    const requests = await HODRequest.find({ status: "PENDING" })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Pending HOD requests fetched successfully",
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Pending HOD request lookup failed:", error.name || "Error");
    return res.status(500).json({ message: "Failed to fetch HOD requests." });
  }
};

const approveHODRequest = async (req, res) => {
  try {
    const { request, account } = await approveRequest({
      Request: HODRequest,
      Account: HOD,
      requestId: req.params.id,
      reviewerId: req.reviewer._id,
      accountIdentifier: (hodRequest) => ({ hodId: hodRequest.hodId }),
      getAccountData: async (hodRequest) => ({
        name: hodRequest.name,
        hodId: hodRequest.hodId,
        email: hodRequest.email,
        department: hodRequest.department,
        image: hodRequest.image || "",
        password: hodRequest.password,
        role: "hod",
        isActive: true,
      }),
    });

    return res.status(200).json({
      message: "HOD approved successfully",
      request: {
        id: request._id,
        status: request.status,
        reviewedBy: request.reviewedBy,
        reviewedAt: request.reviewedAt,
      },
      hod: {
        id: account._id,
        name: account.name,
        hodId: account.hodId,
        department: account.department,
      },
    });
  } catch (error) {
    return respondToApprovalError(res, error, "HOD approval failed.");
  }
};

const rejectHODRequest = async (req, res) => {
  const rejectionReason =
    typeof req.body?.rejectionReason === "string"
      ? req.body.rejectionReason.trim().slice(0, 500)
      : "";

  try {
    const request = await rejectRequest({
      Request: HODRequest,
      requestId: req.params.id,
      reviewerId: req.reviewer._id,
      rejectionReason,
    });

    return res.status(200).json({
      message: "HOD request rejected successfully",
      request: {
        id: request._id,
        name: request.name,
        hodId: request.hodId,
        status: request.status,
        reviewedBy: request.reviewedBy,
        reviewedAt: request.reviewedAt,
        rejectionReason: request.rejectionReason,
      },
    });
  } catch (error) {
    return respondToApprovalError(res, error, "HOD rejection failed.");
  }
};

module.exports = {
  getPendingHODRequests,
  approveHODRequest,
  rejectHODRequest,
};
