const express = require("express");

const router = express.Router();

const controller = require("../controllers/orderHistoryController");

const validation = require("../middlewares/orderHistoryValidation");

const { verifyJWT, authorise } = require("../middlewares/authMiddleware");

// Get All
// router.get(
//     "/",
//     verifyJWT,
//     authorise("patron"),
//     controller.getOrders
// );

router.get(
    "/",
    verifyJWT,
    authorise("patron"),
    controller.getOrderHistory 
);

//filter
router.get(
    "/filter",
    verifyJWT,
    authorise(["patron"]),
    validation.validateFilter,
    controller.filterOrders
);

//get by id
router.get(
  "/:id",
  verifyJWT,
  authorise("patron"),
  controller.getOrderById
);


module.exports = router;