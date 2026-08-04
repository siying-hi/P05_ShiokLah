const express = require("express");
const cleaningController = require("../controllers/cleaningController");
const { requireOfficerLogin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", requireOfficerLogin, cleaningController.getCleaningSubmissions);
router.patch("/:submissionId", requireOfficerLogin, cleaningController.reviewCleaningSubmission);
// PUT alias added for the assignment CRUD demonstration; the existing PATCH route remains supported.
router.put("/:submissionId", requireOfficerLogin, cleaningController.reviewCleaningSubmission);

module.exports = router;
