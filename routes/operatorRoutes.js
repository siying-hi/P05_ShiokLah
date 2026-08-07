const express = require("express");
const router = express.Router();
const path = require("path");
const { verifyJWT, authorise } = require("../middlewares/authMiddleware");
const analyticsController = require("../controllers/operatorAnalyticsController");
const rentalAgreementController = require("../controllers/operatorRAController");
const validation = require("../middlewares/operatorAnalyticsValidation");

// Serve Operator Dashboard HTML
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/operator/operatorDashboard.html"));
});





router.get("/top-ordered", verifyJWT, authorise(["operator"]), validation.validateFilter, analyticsController.getTopStalls,);
// router.get("/total-orders", verifyJWT, authorise(["operator"]),analyticsController.getTotalOrders);
router.get("/feedback", verifyJWT, authorise(["operator"]), validation.validateFilter,analyticsController.getFeedbackDistribution);
router.get("/hygiene", verifyJWT, authorise(["operator"]),analyticsController.getHygieneGrade);

// View all rental agreements
router.get(
    "/api/rentalAgreements/all",
    verifyJWT,
    authorise(["operator"]),
    rentalAgreementController.getAllRentalAgreements
);


// Approve / Reject rental agreement
router.put(
    "/api/rentalAgreements/:id/status",
    verifyJWT,
    authorise(["operator"]),
    rentalAgreementController.updateRentalStatus
);

module.exports = router;
