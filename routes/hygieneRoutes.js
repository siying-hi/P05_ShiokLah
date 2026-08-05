const express = require("express");
const router = express.Router();
const hygieneController = require("../controllers/hygieneController");
const { requireOfficerLogin } = require("../middlewares/authMiddleware");

// GET  /api/nea-officer/hygiene           -> list every stall with its latest grade
router.get("/", requireOfficerLogin, hygieneController.getAllHygieneGrades);

// GET  /api/nea-officer/hygiene/:stallId/history -> full inspection history for one stall
router.get("/:stallId/history", requireOfficerLogin, hygieneController.getStallHygieneHistory);

// POST /api/nea-officer/hygiene/:stallId  -> record a brand new inspection for a stall
router.post("/:stallId", requireOfficerLogin, hygieneController.recordHygieneGrade);

// PUT  /api/nea-officer/hygiene/entry/:hygieneId -> correct an existing entry
router.put("/entry/:hygieneId", requireOfficerLogin, hygieneController.updateHygieneGrade);

// DELETE /api/nea-officer/hygiene/entry/:hygieneId -> permanently remove an entry
router.delete("/entry/:hygieneId", requireOfficerLogin, hygieneController.deleteHygieneGrade);

module.exports = router;