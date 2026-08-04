const sql = require("mssql");
const dbConfig = require("../dbConfig");
const HygieneGrade = require("../models/hygieneModel");
const seedHygieneFallback = require("../models/seedHygieneFallback");
const seedOfficerFallback = require("../models/seedOfficerFallback");
const vendorNotificationStore = require("../models/vendorNotificationStore");
const patronNotificationStore = require("../models/patronNotificationStore");

const VALID_GRADES = ["A", "B", "C", "D"];

function shouldUseSeedFallback(error) {
  return error.code === "ELOGIN" || error.code === "ESOCKET" || error.code === "ETIMEOUT";
}

function getSeedStallContext(stallId) {
  return seedHygieneFallback.getAllWithLatestGrade()
    .find((stall) => Number(stall.stall_id) === Number(stallId)) || null;
}

function createGradeNotification({ context, hygieneId, grade, previousGrade, score, inspectionDate, remarks, action }) {
  if (!context?.vendor_id) return null;
  const wasEdited = action === "updated";
  return vendorNotificationStore.addNotification({
    vendorId: context.vendor_id,
    type: "hygiene-grade",
    hygieneId,
    stallName: context.stall_name,
    grade,
    previousGrade,
    score,
    inspectionDate,
    reason: remarks || "No officer remarks were provided.",
    title: wasEdited ? "Hygiene grade updated" : "New hygiene grade received",
    message: wasEdited
      ? `The NEA officer updated the hygiene grade for ${context.stall_name} to Grade ${grade}.`
      : `The NEA officer assigned Grade ${grade} to ${context.stall_name}.`
  });
}

function syncPatronGradeAlert({ context, hygieneId, grade, score, inspectionDate, remarks }) {
  if (!context?.stall_id) return null;
  patronNotificationStore.resolveHygieneAlerts(context.stall_id);
  if (grade !== "D") return null;
  return patronNotificationStore.addGradeDAlert({
    hygieneId,
    stallId: context.stall_id,
    stallName: context.stall_name,
    score,
    inspectionDate,
    remarks
  });
}

// Looks up the logged-in officer's name to stamp onto the record
async function getOfficerName(officerId) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("officerId", sql.Int, officerId)
      .query("SELECT full_name FROM NEAOfficers WHERE officer_id = @officerId");
    return result.recordset[0]?.full_name || "NEA Officer";
  } catch (error) {
    if (shouldUseSeedFallback(error)) {
      return seedOfficerFallback.findOfficerProfileById(officerId)?.full_name || "NEA Officer";
    }

    throw error;
  }
}

exports.getAllHygieneGrades = async (req, res) => {
  try {
    const stalls = await HygieneGrade.getAllWithLatestGrade();
    res.json(stalls);
  } catch (error) {
    if (shouldUseSeedFallback(error)) {
      return res.json(seedHygieneFallback.getAllWithLatestGrade());
    }

    res.status(500).json({ message: "Failed to load hygiene grades.", error: error.message });
  }
};

exports.getStallHygieneHistory = async (req, res) => {
  const { stallId } = req.params;

  try {
    const history = await HygieneGrade.getHistoryByStallId(stallId);
    res.json(history);
  } catch (error) {
    if (shouldUseSeedFallback(error)) {
      return res.json(seedHygieneFallback.getHistoryByStallId(stallId));
    }

    res.status(500).json({ message: "Failed to load hygiene history.", error: error.message });
  }
};

// Creates a brand new inspection entry for a stall
exports.recordHygieneGrade = async (req, res) => {
  const { stallId } = req.params;
  const { hygieneGrade, score, inspectionDate, inspectionTime, remarks } = req.body;

  if (!hygieneGrade || !VALID_GRADES.includes(hygieneGrade.toUpperCase())) {
    return res.status(400).json({ message: "A valid hygiene grade (A, B, C or D) is required." });
  }
  if (!inspectionDate) {
    return res.status(400).json({ message: "Inspection date is required." });
  }

  try {
    const inspectionBy = await getOfficerName(req.session.officerId);

    const hygieneId = await HygieneGrade.create({
      stallId,
      hygieneGrade: hygieneGrade.toUpperCase(),
      score,
      inspectionDate,
      inspectionTime,
      inspectionBy,
      remarks
    });

    const context = await HygieneGrade.getStallNotificationContext(stallId);
    const notification = createGradeNotification({
      context, hygieneId, grade: hygieneGrade.toUpperCase(), score, inspectionDate, remarks, action: "created"
    });
    const patronAlert = syncPatronGradeAlert({
      context, hygieneId, grade: hygieneGrade.toUpperCase(), score, inspectionDate, remarks
    });
    res.status(201).json({ message: "Hygiene grade saved successfully.", hygieneId, notification, patronAlert });
  } catch (error) {
    if (shouldUseSeedFallback(error)) {
      const inspectionBy = seedOfficerFallback.findOfficerProfileById(req.session.officerId)?.full_name || "NEA Officer";
      const hygieneId = seedHygieneFallback.create({
        stallId,
        hygieneGrade: hygieneGrade.toUpperCase(),
        score,
        inspectionDate,
        inspectionTime,
        inspectionBy,
        remarks
      });

      const notification = createGradeNotification({
        context: getSeedStallContext(stallId),
        hygieneId,
        grade: hygieneGrade.toUpperCase(),
        score,
        inspectionDate,
        remarks,
        action: "created"
      });
      const context = getSeedStallContext(stallId);
      const patronAlert = syncPatronGradeAlert({
        context, hygieneId, grade: hygieneGrade.toUpperCase(), score, inspectionDate, remarks
      });
      return res.status(201).json({ message: "Hygiene grade saved successfully.", hygieneId, notification, patronAlert });
    }

    res.status(500).json({ message: "Failed to save hygiene grade.", error: error.message });
  }
};

// Edits an existing hygiene grade entry (in place correction)
exports.updateHygieneGrade = async (req, res) => {
  const { hygieneId } = req.params;
  const { hygieneGrade, score, inspectionDate, inspectionTime, remarks } = req.body;

  if (!hygieneGrade || !VALID_GRADES.includes(hygieneGrade.toUpperCase())) {
    return res.status(400).json({ message: "A valid hygiene grade (A, B, C or D) is required." });
  }
  if (!inspectionDate) {
    return res.status(400).json({ message: "Inspection date is required." });
  }

  try {
    const previous = await HygieneGrade.getById(hygieneId);
    const inspectionBy = await getOfficerName(req.session.officerId);

    const updated = await HygieneGrade.update(hygieneId, {
      hygieneGrade: hygieneGrade.toUpperCase(),
      score,
      inspectionDate,
      inspectionTime,
      inspectionBy,
      remarks
    });

    if (!updated) {
      return res.status(404).json({ message: "Hygiene grade entry not found." });
    }

    const context = await HygieneGrade.getStallNotificationContext(updated.stall_id);
    const notification = createGradeNotification({
      context,
      hygieneId,
      grade: hygieneGrade.toUpperCase(),
      previousGrade: previous?.hygiene_grade,
      score,
      inspectionDate,
      remarks,
      action: "updated"
    });
    const patronAlert = syncPatronGradeAlert({
      context, hygieneId, grade: hygieneGrade.toUpperCase(), score, inspectionDate, remarks
    });
    res.json({ message: "Hygiene grade updated successfully.", hygieneGrade: updated, notification, patronAlert });
  } catch (error) {
    if (shouldUseSeedFallback(error)) {
      const previous = seedHygieneFallback.getById(hygieneId);
      const previousGrade = previous?.hygiene_grade;
      const inspectionBy = seedOfficerFallback.findOfficerProfileById(req.session.officerId)?.full_name || "NEA Officer";
      const updated = seedHygieneFallback.update(hygieneId, {
        hygieneGrade: hygieneGrade.toUpperCase(),
        score,
        inspectionDate,
        inspectionTime,
        inspectionBy,
        remarks
      });

      if (!updated) {
        return res.status(404).json({ message: "Hygiene grade entry not found." });
      }

      const notification = createGradeNotification({
        context: getSeedStallContext(updated.stall_id),
        hygieneId,
        grade: hygieneGrade.toUpperCase(),
        previousGrade,
        score,
        inspectionDate,
        remarks,
        action: "updated"
      });
      const context = getSeedStallContext(updated.stall_id);
      const patronAlert = syncPatronGradeAlert({
        context, hygieneId, grade: hygieneGrade.toUpperCase(), score, inspectionDate, remarks
      });
      return res.json({ message: "Hygiene grade updated successfully.", hygieneGrade: updated, notification, patronAlert });
    }

    res.status(500).json({ message: "Failed to update hygiene grade.", error: error.message });
  }
};

// Deletes a single hygiene grade entry permanently
exports.deleteHygieneGrade = async (req, res) => {
  try {
    const { hygieneId } = req.params;

    const deleted = await HygieneGrade.deleteEntry(hygieneId);

    if (!deleted) {
      return res.status(404).json({ message: "Hygiene grade entry not found." });
    }

    res.json({ message: "Hygiene grade deleted successfully." });
  } catch (error) {
    if (shouldUseSeedFallback(error)) {
      const deleted = seedHygieneFallback.deleteEntry(req.params.hygieneId);

      if (!deleted) {
        return res.status(404).json({ message: "Hygiene grade entry not found." });
      }

      return res.json({ message: "Hygiene grade deleted successfully." });
    }

    res.status(500).json({ message: "Failed to delete hygiene grade.", error: error.message });
  }
};
