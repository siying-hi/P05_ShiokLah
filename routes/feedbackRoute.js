const express = require("express");
const router = express.Router();

const feedbackController =
    require("../controllers/feedbacksController");

const {
    verifyJWT,
    authorise
} = require("../middlewares/authMiddleware");

const {
    validateFeedbackId,
    validateCreateFeedback,
    validateUpdateFeedback
} = require("../middlewares/feedbacksValidation");


// Get all stalls
router.get(
    "/stalls",
    verifyJWT,
    authorise(["patron"]),
    feedbackController.getAllStalls
);


// Get logged-in patron's orders
router.get(
    "/orders",
    verifyJWT,
    authorise(["patron"]),
    feedbackController.getPatronOrders
);


// Get all feedback belonging to logged-in patron
router.get(
    "/",
    verifyJWT,
    authorise(["patron"]),
    feedbackController.getFeedbacksByPatron
);


// Get one feedback
router.get(
    "/:id",
    verifyJWT,
    authorise(["patron"]),
    validateFeedbackId,
    feedbackController.getFeedbackById
);


// Create feedback
router.post(
    "/",
    verifyJWT,
    authorise(["patron"]),
    validateCreateFeedback,
    feedbackController.createFeedback
);


// Update feedback
router.put(
    "/:id",
    verifyJWT,
    authorise(["patron"]),
    validateFeedbackId,
    validateUpdateFeedback,
    feedbackController.updateFeedback
);


// Delete feedback
router.delete(
    "/:id",
    verifyJWT,
    authorise(["patron"]),
    validateFeedbackId,
    feedbackController.deleteFeedback
);


module.exports = router;