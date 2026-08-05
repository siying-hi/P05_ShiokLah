const express = require("express");
const router = express.Router();

// Controllers for each page
const homeController = require("../controllers/homeController");
const orderController = require("../controllers/orderController");
const profileController = require("../controllers/profileController");
const authController = require("../controllers/authController");

// Home page
router.get("/", homeController.showHome);

// Order History
router.get("/order-history", orderController.showOrderHistory);

// Profile dropdown routes
router.get("/profile/overview", profileController.showOverview);
router.get("/profile/analytics", profileController.showAnalytics);
router.get("/profile/feedback", profileController.showFeedback);
router.get("/profile/favourites", profileController.showFavourites);
router.get("/profile/rewards", profileController.showRewards);

// Log Out
router.get("/logout", authController.logout);

module.exports = router;
