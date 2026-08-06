const express = require("express");
const router = express.Router();

//Controllers
const vendorController = require("../controllers/vendorController");
const vendorRouteController = require("../controllers/vendorRouteController");
const menuItemController = require("../controllers/menuItemController");
const cuisineController = require("../controllers/cuisineController");
const foodCertController = require("../controllers/foodCertController");
const vendorCleaningSubmissionController = require("../controllers/vendorCleaningSubmissionController");
const vendorHygieneController = require("../controllers/vendorHygieneController");
const rentalAgreementController = require("../controllers/rentalAgreementController");
const vendorNotificationStore = require("../models/vendorNotificationStore");
const orderController = require("../controllers/vendorOrderController");
const reviewController = require("../controllers/vendorReviewsController");

//Middlewares
const { verifyJWT, authorise } = require("../middlewares/authMiddleware");
const {
    validateMenuItem,
    validateMenuItemId,
    validateCreateMenuItem,
    validateVisibility
} = require("../middlewares/menuValidation");

const {
    validateCreateCuisine,
    validateCuisineId
}=require("../middlewares/cuisineValidation");

const {
    validateCreateFoodCert,
    validateFoodCertId
} = require("../middlewares/foodCertValidation");

const {
    validateVendorCleaningSubmission
} = require("../middlewares/vendorCleaningSubmissionValidation");

const {
    validateRentalAgreement,
    validateRentalAgreementId,
    validateCreateRentalAgreement
}
=
require("../middlewares/rentalAgreementValidation");

//Navigation Routes
router.get("/performance-dashboard", vendorRouteController.showPerformanceDashboard);
router.get("/manage-menu-item", vendorRouteController.showVendorMenuItem);
router.get("/manage-order", vendorRouteController.showVendorOrder);
router.get("/manage-profile", vendorRouteController.showVendorProfile);
router.get("/manage-rental-agreement", vendorRouteController.showRentalAgreement);
router.get("/stallHygiene", vendorRouteController.showStallHygiene);
router.get("/cleaningSubmissions", vendorRouteController.showCleaningSubmissions);
router.get("/manage-food-handler-cert", vendorRouteController.showVendorFoodHandlerCert);
router.get("/view-reviews", vendorRouteController.showVendorReviews);

// Menu Item API(Returns json objects)
router.get("/api/menuItems", verifyJWT,authorise("vendor"), menuItemController.getAllMenuItems);
router.post("/api/menuItems", verifyJWT,authorise("vendor"),validateCreateMenuItem,menuItemController.createMenuItem);
router.put("/api/menuItems/:id",verifyJWT, authorise("vendor"), validateMenuItemId, validateMenuItem, menuItemController.updateMenuItem);
router.delete("/api/menuItems/:id",verifyJWT,authorise("vendor"),validateMenuItemId,menuItemController.deleteMenuItem);
router.put("/api/menuItems/:id/visibility",verifyJWT,authorise("vendor"),validateMenuItemId,validateVisibility,menuItemController.updateMenuItemVisibility);

// Cuisine API
router.get("/api/cuisine", verifyJWT, authorise("vendor"), cuisineController.getVendorCuisines);
router.get("/api/currentCuisine", verifyJWT, authorise("vendor"), cuisineController.getCuisine);
router.post("/api/cuisine", verifyJWT, authorise("vendor"), validateCreateCuisine, cuisineController.createCuisine);
router.put("/api/cuisine/:id", verifyJWT, authorise("vendor"), validateCuisineId, cuisineController.updateCuisine);
router.delete("/api/cuisine/:id", verifyJWT, authorise("vendor"), validateCuisineId, cuisineController.deleteCuisine);


// Food Handler Certificate API
router.get("/api/foodCert", verifyJWT, authorise("vendor"), foodCertController.getFoodHandlerCertByVendorId);
router.get("/api/vendor/certificate-notifications", verifyJWT, authorise("vendor"), (req, res) => {
    res.json(vendorNotificationStore.getNotificationsForVendor(req.user.id));
});
router.get("/api/vendor/notifications", verifyJWT, authorise("vendor"), (req, res) => {
    res.json(vendorNotificationStore.getNotificationsForVendor(req.user.id));
});
router.patch("/api/vendor/notifications/:notificationId/read", verifyJWT, authorise("vendor"), (req, res) => {
    const notification = vendorNotificationStore.markNotificationRead(req.user.id, req.params.notificationId);
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    res.json({ message: "Notification marked as read.", notification });
});
router.post("/api/foodCert", verifyJWT, authorise("vendor"), validateCreateFoodCert, foodCertController.createFoodHandlerCertificate);
router.put("/api/foodCert/:id", verifyJWT, authorise("vendor"), validateFoodCertId, validateCreateFoodCert, foodCertController.updateCertificate);
router.delete("/api/foodCert/:id", verifyJWT, authorise("vendor"), validateFoodCertId, foodCertController.deleteCertificate);

// Vendor Hygiene Grade API
router.get(
    "/api/vendor/hygiene-grades",
    verifyJWT,
    authorise("vendor"),
    vendorHygieneController.getVendorHygiene
);

// Vendor Cleaning Submission API
router.post(
    "/api/vendor/cleaning-submissions",
    verifyJWT,
    authorise("vendor"),
    validateVendorCleaningSubmission,
    vendorCleaningSubmissionController.submitCleaningSubmission
);
router.get(
    "/api/vendor/cleaning-submissions",
    verifyJWT,
    authorise("vendor"),
    vendorCleaningSubmissionController.getCleaningSubmissions
);

// Rental Agreement API
router.get("/api/rentalAgreement",verifyJWT, authorise("vendor"),rentalAgreementController.getRentalAgreements);
router.get("/api/rentalAgreement/:id", verifyJWT, authorise("vendor"), rentalAgreementController.getRentalAgreementById);
router.post("/api/rentalAgreement", verifyJWT, authorise("vendor"), rentalAgreementController.createRentalAgreement);
router.put("/api/rentalAgreement/:id",verifyJWT,authorise("vendor"),rentalAgreementController.updateRentalAgreement);

// Order
router.get("/api/orders",verifyJWT,authorise(["vendor", "patron"]),orderController.getOrdersByStallId);
router.put("/api/orders/:id/status",verifyJWT,authorise("vendor"),orderController.updateOrderStatusAsVendor);


//Vendor Profile
router.get("/api/profile",verifyJWT,authorise("vendor"),vendorController.getVendorProfile);

// Reviews
router.get("/api/vendor-complaint",verifyJWT,authorise("vendor"),reviewController.getComplaintByStallId);
router.get("/api/vendor-feedback",verifyJWT,authorise("vendor"),reviewController.getFeedbackByStallId);

const orderHistoryController = require("../controllers/vendorDashboardController");

router.get("/api/totalOrders",verifyJWT,authorise("vendor"),orderHistoryController.getTotalOrders);
router.get("/api/customerFrequency",verifyJWT,authorise("vendor"),orderHistoryController.getCustomerFrequency);
router.get("/api/menuPerformance",verifyJWT,authorise("vendor"),orderHistoryController.getMenuPerformance
);
router.get("/api/averageRevenue",verifyJWT, authorise("vendor"), orderHistoryController.getAverageRevenue);
module.exports = router;
