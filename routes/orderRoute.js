const express =
    require("express");

const router =
    express.Router();

const orderController =
    require("../controllers/orderController");

const {
    verifyJWT,
    authorise
} = require("../middlewares/authMiddleware");


router.get(
    "/",
    verifyJWT,
    authorise(["patron"]),
    orderController.getOrderStatus
);


router.put(
    "/:orderId",
    verifyJWT,
    authorise(["patron"]),
    orderController.updateOrderStatus
);


router.post(
    "/:orderId/collect",
    verifyJWT,
    authorise(["patron"]),
    orderController.collectOrder
);


module.exports =
    router;