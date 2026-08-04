const alerts = [];

function resolveHygieneAlerts(stallId) {
  alerts.forEach((alert) => {
    if (Number(alert.stallId) === Number(stallId) && !alert.resolvedAt) {
      alert.resolvedAt = new Date().toISOString();
    }
  });
}

function addGradeDAlert({ hygieneId, stallId, stallName, score, inspectionDate, remarks }) {
  resolveHygieneAlerts(stallId);
  const alert = {
    id: alerts.length + 1,
    type: "hygiene-grade-d",
    hygieneId: Number(hygieneId),
    stallId: Number(stallId),
    stallName,
    grade: "D",
    score: score ?? null,
    inspectionDate,
    remarks: remarks || "Please exercise caution when ordering from this stall.",
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    readBy: []
  };
  alerts.unshift(alert);
  return alert;
}

function getUnreadAlertsForPatron(patronId) {
  return alerts.filter((alert) =>
    !alert.resolvedAt && !alert.readBy.includes(Number(patronId))
  );
}

function markAlertRead(patronId, alertId) {
  const alert = alerts.find((item) => item.id === Number(alertId) && !item.resolvedAt);
  if (!alert) return null;
  if (!alert.readBy.includes(Number(patronId))) alert.readBy.push(Number(patronId));
  return alert;
}

module.exports = {
  addGradeDAlert,
  resolveHygieneAlerts,
  getUnreadAlertsForPatron,
  markAlertRead
};
