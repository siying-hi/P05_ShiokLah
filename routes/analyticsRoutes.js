const express = require("express");
const path = require("path");
const router = express.Router();
const { verifyJWT, authorise } = require("../middlewares/authMiddleware");
const analyticsController = require("../controllers/analyticsController");



// Serve the Analytics dashboard page (HTML)
router.get("/", verifyJWT, authorise("patron"),  (req, res) => {
  res.sendFile(path.join(__dirname, "../public/patron/Analytics.html"));
});

// Protected API endpoints for chart data
// router.get(
//     "/api/analytics/dashboard",
//     verifyJWT,
//     authorise(["patron"]),
//     analyticsController.getDashboardAnalytics
// );

// router.get("/popular-items", analyticsController.getPopularItemsMonthly);
router.get("/total-orders", verifyJWT, authorise("patron"),analyticsController.getTotalOrders);
// router.get("/most-ordered", verifyJWT, authorise("patron"), analyticsController.getTopOrderedItems);
router.get(
    "/most-ordered/:months",
    verifyJWT,
    authorise("patron"),
    analyticsController.getTopOrderedItems
);
router.get("/feedback", verifyJWT, authorise("patron"), analyticsController.getFeedbackDistribution);
router.get("/hygiene", verifyJWT, authorise("patron"), analyticsController.getHygieneGrade);

module.exports = router;


