const orderModel = require("../models/vendorOrderModel");
const vendorController = require("./vendorController");

// Vendor views incoming orders
async function getOrdersByStallId(req,res) {
    try {
        const stallId = await vendorController.getVendorStallId(req);
        const orders = await orderModel.getOrdersByStallId(stallId);
        res.status(200).json({
            success:true,
            data:orders
        });

    } catch(error) {
        console.error(
            "Get vendor orders error:",
            error
        );
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

// Vendor updates order status
async function updateOrderStatusAsVendor(req,res) {
    try {
        const stallId =  await vendorController.getVendorStallId(req);
        const orderId =req.params.id;

        const {
            order_status
        } = req.body;

        const allowedStatus = [
            "Pending",
            "Preparing"
        ];

        if(
            !allowedStatus.includes(order_status)
        ) {

            return res.status(400).json({
                success:false,
                message:
                "Invalid order status"
            });
        }

        const updated = await orderModel.updateOrderStatusAsVendor(
                orderId,
                stallId,
                order_status
            );

        if(updated === 0) {
            return res.status(404).json({
                success:false,
                message:
                "Order not found or does not belong to this stall"
            });
        }

        res.status(200).json({
            success:true,
            message:
            "Order status updated successfully"
        });

    } catch(error) {
        console.error(
            "Update order status error:",
            error
        );

        res.status(500).json({
            success:false,
            message:error.message
        });
    }
}

module.exports = {
    getOrdersByStallId,
    updateOrderStatusAsVendor
};