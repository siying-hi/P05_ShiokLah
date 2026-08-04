const orderModel = require("../models/orderModel");

async function getOrderStatus(req, res) {

    try {

        const patronId = req.user.id;

        const orders =
            await orderModel.getOrderStatus(
                patronId
            );

        res.json(orders);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to retrieve order status."
        });

    }

}


async function updateOrderStatus(req, res) {

    try {

        const patronId = req.user.id;

        const orderId =
            Number(req.params.orderId);

        const status =
            String(req.body.status || "").trim();

        const allowedStatuses = [
            "Pending",
            "Preparing",
            "Ready",
            "Completed"
        ];

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid order id."
            });

        }

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                message: "Invalid order status."
            });

        }

        const updated =
            await orderModel.updateOrderStatus(
                orderId,
                patronId,
                status
            );

        if (!updated) {

            return res.status(404).json({
                message: "Order not found."
            });

        }

        res.json({
            message:
                "Order status updated successfully."
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to update order status."
        });

    }

}


async function collectOrder(req, res) {

    try {

        const patronId = req.user.id;

        const orderId =
            Number(req.params.orderId);

        if (
            !Number.isInteger(orderId) ||
            orderId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid order id."
            });

        }

        const collected =
            await orderModel.collectOrder(
                orderId,
                patronId
            );

        if (!collected) {

            return res.status(404).json({
                message:
                    "Order not found or does not belong to you."
            });

        }

        res.json({
            message:
                "Order collected successfully."
        });

    }
    catch (error) {

        console.error(
            "Collect order error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to collect order."
        });

    }

}


module.exports = {
    getOrderStatus,
    updateOrderStatus,
    collectOrder
};