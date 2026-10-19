const mongoose = require("mongoose");

class ApprovalWorkflowError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const withApprovalTransaction = async (callback) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await callback(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

const approveRequest = async ({
  Request,
  Account,
  requestId,
  reviewerId,
  requestDepartment,
  accountIdentifier,
  getAccountData,
}) =>
  withApprovalTransaction(async (session) => {
    const filter = {
      _id: requestId,
      status: "PENDING",
      ...(requestDepartment ? { department: requestDepartment } : {}),
    };
    const request = await Request.findOne(filter)
      .select("+password")
      .session(session);

    if (!request) {
      throw new ApprovalWorkflowError(
        "Pending request not found or is outside your department.",
        404
      );
    }

    if (!request.password) {
      throw new ApprovalWorkflowError(
        "This request predates password capture. Reject it so the applicant can resubmit with a password.",
        409
      );
    }

    if (await Account.findOne(accountIdentifier(request)).session(session)) {
      throw new ApprovalWorkflowError(
        "An account with this identifier already exists.",
        409
      );
    }

    if (
      request.email &&
      (await Account.findOne({ email: request.email }).session(session))
    ) {
      throw new ApprovalWorkflowError(
        "This email address is already assigned to an account.",
        409
      );
    }

    const [account] = await Account.create([await getAccountData(request)], {
      session,
    });

    request.status = "APPROVED";
    request.decision = "APPROVED";
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    request.rejectionReason = "";
    await request.save({ session });

    return { request, account };
  });

const rejectRequest = async ({
  Request,
  requestId,
  reviewerId,
  requestDepartment,
  rejectionReason,
}) =>
  withApprovalTransaction(async (session) => {
    const request = await Request.findOne({
      _id: requestId,
      status: "PENDING",
      ...(requestDepartment ? { department: requestDepartment } : {}),
    }).session(session);

    if (!request) {
      throw new ApprovalWorkflowError(
        "Pending request not found or is outside your department.",
        404
      );
    }

    request.status = "REJECTED";
    request.decision = "REJECTED";
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save({ session });

    return request;
  });

const respondToApprovalError = (res, error, fallbackMessage) => {
  if (error instanceof ApprovalWorkflowError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({
      message: "A conflicting account or request already exists.",
    });
  }

  console.error("Approval workflow failed:", error.name || "Error");
  return res.status(500).json({ message: fallbackMessage });
};

module.exports = {
  approveRequest,
  rejectRequest,
  respondToApprovalError,
};
