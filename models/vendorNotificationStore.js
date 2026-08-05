const notifications = [];

function addNotification({ vendorId, type, title, message, certificateId, submissionId, hygieneId, status, reason, dueDate, stallName, grade, previousGrade, score, inspectionDate }) {
  const existing = notifications.find((item) =>
    item.vendorId === Number(vendorId) &&
    item.type === type &&
    (
      (certificateId && item.certificateId === Number(certificateId)) ||
      (submissionId && item.submissionId === Number(submissionId))
    )
  );
  if (existing) return existing;

  const notification = {
    id: notifications.length + 1,
    vendorId: Number(vendorId),
    type,
    title,
    message,
    certificateId: certificateId ? Number(certificateId) : null,
    submissionId: submissionId ? Number(submissionId) : null,
    hygieneId: hygieneId ? Number(hygieneId) : null,
    status: status || null,
    reason: reason || "",
    dueDate: dueDate || null,
    stallName: stallName || "",
    grade: grade || null,
    previousGrade: previousGrade || null,
    score: score ?? null,
    inspectionDate: inspectionDate || null,
    createdAt: new Date().toISOString(),
    readAt: null
  };
  notifications.unshift(notification);
  return notification;
}

function getNotificationsForVendor(vendorId) {
  return notifications.filter((item) => item.vendorId === Number(vendorId));
}

function markNotificationRead(vendorId, notificationId) {
  const notification = notifications.find((item) =>
    item.id === Number(notificationId) && item.vendorId === Number(vendorId)
  );
  if (!notification) return null;
  notification.readAt = notification.readAt || new Date().toISOString();
  return notification;
}

module.exports = { addNotification, getNotificationsForVendor, markNotificationRead };
