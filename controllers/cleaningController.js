const cleaningModel = require("../models/cleaningModel");
const vendorNotificationStore = require("../models/vendorNotificationStore");

const rejectedNotifications = new Map();

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split("T")[0];
}

function buildRejectedNotification(submission, dueDate) {
  return {
    sentTo: submission.vendorEmail,
    vendorName: submission.vendorName,
    dueDate,
    message: `Your cleaning photo submission for ${submission.stall} was rejected. Please submit a new watermarked cleaning photo by ${dueDate}.`
  };
}

exports.getCleaningSubmissions = async (req, res) => {
  try {
    const submissions = await cleaningModel.getCleaningSubmissions();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load cleaning submissions.",
      error: error.message
    });
  }
};

exports.reviewCleaningSubmission = async (req, res) => {
  try {
    const submissionId = Number(req.params.submissionId);
    const status = String(req.body.status || "").toLowerCase();
    const remarks = String(req.body.remarks || "").trim();

    if (!Number.isInteger(submissionId)) {
      return res.status(400).json({ message: "Invalid cleaning submission id." });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected." });
    }

    if (!remarks) {
      return res.status(400).json({ message: "A review reason is required." });
    }

    const reviewedBy = req.session?.officerId ? `Officer ${req.session.officerId}` : "NEA Officer";
    const updated = await cleaningModel.reviewCleaningSubmission(submissionId, {
      status,
      remarks,
      reviewedBy
    });

    if (!updated) {
      return res.status(404).json({ message: "Cleaning submission not found." });
    }

    const payload = {
      message: `Cleaning submission ${status}.`,
      submission: updated
    };

    const vendorId = Number(String(updated.vendorId || "").replace(/\D/g, ""));
    const dueDate = status === "rejected"
      ? (req.body.dueDate || addDays(new Date(), 3))
      : null;
    const decisionNotification = vendorNotificationStore.addNotification({
      vendorId,
      type: "cleaning-decision",
      submissionId,
      status,
      stallName: updated.stall,
      reason: remarks,
      dueDate,
      title: status === "approved" ? "Cleaning submission approved" : "Cleaning submission not approved",
      message: status === "approved"
        ? `Your cleaning submission for ${updated.stall} was approved by the NEA officer.`
        : `Your cleaning submission for ${updated.stall} was not approved. Please review the officer's reason and resubmit by ${dueDate}.`
    });
    payload.notification = decisionNotification;

    if (status === "rejected") {
      const notification = buildRejectedNotification(updated, dueDate);
      rejectedNotifications.set(submissionId, {
        ...notification,
        sentAt: new Date().toISOString()
      });
      payload.message = `Cleaning submission rejected. Resubmission notification sent to ${notification.sentTo}.`;
      payload.emailNotification = rejectedNotifications.get(submissionId);
    }

    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cleaning submission.",
      error: error.message
    });
  }
};
