const express = require("express");
const path = require("path");
const router = express.Router();

const { verifyJWT, authorise } = require("../middlewares/authMiddleware");
const { validateUpdateProfile } = require("../middlewares/patronProfileValidation");
const { validateStallId } = require("../middlewares/stallIdValidation");
const { validateAddToCart, validateUpdateQuantity, validateRemoveItem } = require("../middlewares/cartValidation");
const { validateCheckout } = require("../middlewares/orderValidation");
const { validateCard, validateUpdateCard, validateCardId } = require("../middlewares/cardValidation");
const patronRouteController = require("../controllers/patronRouteController");
const patronProfileController = require("../controllers/patronProfileController");
const patronHomepageController = require("../controllers/patronHomepageController");
const patronMenuController = require("../controllers/patronMenuController");
const cartController = require("../controllers/cartController");
const paymentController = require("../controllers/paymentController");
const cardController = require("../controllers/cardController");
const patronNotificationStore = require("../models/patronNotificationStore");

// Main page
router.get("/patron-homepage", patronRouteController.showPatronHomepage);
router.get(
    "/api/patron-homepage",
    verifyJWT,
    authorise(["patron"]),
    patronHomepageController.getPatronHomepage
);
router.get("/api/patron/hygiene-alerts", verifyJWT, authorise(["patron"]), (req, res) => {
    res.json(patronNotificationStore.getUnreadAlertsForPatron(req.user.id));
});
router.patch("/api/patron/hygiene-alerts/:alertId/read", verifyJWT, authorise(["patron"]), (req, res) => {
    const alert = patronNotificationStore.markAlertRead(req.user.id, req.params.alertId);
    if (!alert) return res.status(404).json({ message: "Hygiene alert not found." });
    res.json({ message: "Hygiene alert marked as read.", alert });
});

//Display stall menu page
router.get(
    "/stall-menu",
    patronRouteController.showStallMenu
);

//Display stall menu
router.get(
    "/api/stall-menu/:stallId",
    verifyJWT,
    authorise(["patron"]),
    validateStallId,
    patronMenuController.getStallMenu
);

// Get current patron's cart
router.get(
    "/api/cart",
    verifyJWT,
    authorise(["patron"]),
    cartController.getCart
);

// Add a new menu item to cart or create cart
router.post(
    "/api/cart",
    verifyJWT,
    authorise(["patron"]),
    validateAddToCart,
    cartController.addToCart
);

// Update quantity (+ and -)
router.put(
    "/api/cart",
    verifyJWT,
    authorise(["patron"]),
    validateUpdateQuantity,
    cartController.updateQuantity
);

// Remove an item completely
router.delete(
    "/api/cart/:itemId",
    verifyJWT,
    authorise(["patron"]),
    validateRemoveItem,
    cartController.removeItem
);

// Clear entire cart
router.delete(
    "/api/cart",
    verifyJWT,
    authorise(["patron"]),
    cartController.clearCart
);

//Display checkout page
router.get("/checkout", patronRouteController.showPatronCheckout);

router.get("/payment-success", patronRouteController.showPaymentSuccess);

router.get("/payment-failed", patronRouteController.showPaymentFailed);

// Process payment and create order if payment success. Otherwise, block order creation.
router.post(
    "/api/payment",
    verifyJWT,
    authorise(["patron"]),
    validateCheckout,
    paymentController.processPayment
);

//Display patron profile page
router.get("/patron-profile", patronRouteController.showPatronProfile);

//Display patron profile
router.get(
    "/api/patron-profile",
    verifyJWT,
    authorise(["patron"]),
    patronProfileController.getPatronProfile
);

//Update profile
router.put(
    "/api/patron-profile",
    verifyJWT,
    authorise(["patron"]),
    validateUpdateProfile,
    patronProfileController.updatePatronProfile
);

//Add a card
router.post(
    "/api/cards",
    verifyJWT,
    authorise(["patron"]),
    validateCard,
    cardController.addCard
);

//Display Visa cards
router.get(
    "/api/cards",
    verifyJWT,
    authorise(["patron"]),
    cardController.getCardsByPatronId
);

// Update Visa card info
router.put(
    "/api/cards/:cardId",
    verifyJWT,
    authorise(["patron"]),
    validateUpdateCard,
    cardController.updateCard
);

//Set a default Visa card
router.put(
    "/api/cards/:cardId/default",
    verifyJWT,
    authorise(["patron"]),
    validateCardId,
    cardController.setDefaultCard
);

//Get the default Visa card
router.get(
    "/api/cards/default",
    verifyJWT,
    authorise(["patron"]),
    cardController.getDefaultCard
);

// Get specific Visa card
router.get(
    "/api/cards/:cardId",
    verifyJWT,
    authorise(["patron"]),
    validateCardId,
    cardController.getCardById
);

//Delete a Visa card
router.delete(
    "/api/cards/:cardId",
    verifyJWT,
    authorise(["patron"]),
    validateCardId,
    cardController.deleteCard
);

//Delete patron account
router.delete(
    "/api/patron-profile",
    verifyJWT,
    authorise(["patron"]),
    patronProfileController.deletePatronAccount
);


// Order History page
router.get("/order-history",patronRouteController.showOrderHistory);


module.exports = router;
