const orderHistoryModel = require("../models/orderHistoryModel");
const favouriteModel = require("../models/favOrderHistoryModel");



function groupOrders(rows) {
    const grouped = {};

    rows.forEach(row => {
        if (!grouped[row.order_id]) {
            grouped[row.order_id] = {
                order_id: row.order_id,
                history_id: row.history_id,
                stall_id: row.stall_id,
                order_date: row.order_date,
                order_status: row.order_status,
                items: [],
                total_amt: 0
            };
        }

        grouped[row.order_id].items.push({
            item_id: row.item_id,
            item_name: row.item_name,
            quantity: row.quantity,
            price: row.price
        });

        grouped[row.order_id].total_amt += row.price * row.quantity;
    });

    return Object.values(grouped);
}

// =========================
// GET ORDER HISTORY
// =========================
// Fetch all orders for the logged-in patron.
// Groups order items by order_id so each order is returned once
// with its associated items and calculated total amount.
async function getOrderHistory(req, res) {
  try {
    const patronId = req.user.id;

    const rows = await orderHistoryModel.getOrdersByPatron(patronId);
    res.json({ orders: groupOrders(rows) });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ orders: [] });
  }
}



// =========================
// FILTER ORDERS
// =========================
// Filter the logged-in patron's order history by
// order status and/or date range.
// Groups matching items by order_id before returning the results.
async function filterOrders(req, res) {
  try {
    const patronId = req.user.id;
    const { status, startDate, endDate } = req.query;

    const rows = await orderHistoryModel.filterOrders(
      patronId,
      status,
      startDate,
      endDate
    );

    res.json({ orders: groupOrders(rows) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to filter orders." });
  }
}


// =========================
// GET ORDER BY ID
// =========================
// Retrieve a specific order by its order_id for the logged-in patron.
// Returns 404 if the order does not exist or does not belong to the patron.
async function getOrderById(req, res) {
  try {
    const patronId = req.user.id;
    const orderId = req.params.id;
    const order = await orderHistoryModel.getOrderById(orderId, patronId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve order." });
  }
}


// =========================
// GET ALL FAVOURITES
// =========================
// Retrieve all favourite orders belonging to the logged-in patron.
// Returns the list of saved favourite orders.
async function getAllFavourites(req, res) {

    try {
        const patronId = req.user.id;
        const favourites =
            await favouriteModel.getAllFavourites(patronId);

        res.status(200).json(favourites);
    }
    catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Internal server error."
        });
    }
}

// =========================
// GET FAVOURITE BY ID
// =========================
// Retrieve a single favourite order by its favourite_id.
// Returns 404 if the favourite does not exist.
async function getFavouriteById(req, res) {
    try {

        const favourite =
            await favouriteModel.getFavouriteById(req.params.id);
        if (!favourite) {
            return res.status(404).json({
                message: "Favourite not found."
            });
        }
        res.status(200).json(favourite);
    }
    catch (err) {

        console.error(err);
        res.status(500).json({
            message: "Internal server error."
        });
    }
}

// =========================
// CREATE FAVOURITE
// =========================
// Create a new favourite order for the logged-in patron.
// Verifies that the order exists and has not already been
// added to favourites before saving it.
async function createFavourite(req, res) {
  try {
    const patronId = req.user.id;
    const { orderId, customName } = req.body;
    // Check if order exists by order_id
    const order = await orderHistoryModel.getOrderById(orderId, patronId);

    if (!order) {
    return res.status(400).json({ message: "Order does not exist." });
    }
    // Check if already favourited
    const existing = await favouriteModel.findByPatronAndOrder(patronId, orderId);
    if (existing) {
      return res.status(400).json({ message: "Order already favourited." });
    }

    // Create favourite
    const favourite = await favouriteModel.createFavourite({ orderId, patronId, customName });
    res.status(201).json(favourite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to create favourite." });
  }
}


// =========================
// UPDATE FAVOURITE
// =========================
// Update the custom name of an existing favourite order.
// Returns 404 if the favourite record cannot be found.
async function updateFavourite(req, res) {
    try {
        const favourite = {
            id: req.params.id,
            customName: req.body.customName
        };
        const updated =
            await favouriteModel.updateFavourite(favourite);

        if (!updated) {
            return res.status(404).json({
                message: "Favourite not found."
            });
        }
        res.status(200).json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Unable to update favourite."
        });
    }
}

// =========================
// DELETE FAVOURITE
// =========================
// Remove a favourite order from the logged-in patron's list.
// Returns 404 if the favourite record does not exist.
async function deleteFavourite(req, res) {
    try {
        const deleted =
            await favouriteModel.deleteFavourite(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                message: "Favourite not found."
            });
        }
        res.status(200).json(deleted);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Unable to delete favourite."
        });
    }
}

// Export all controller functions for use in routes
module.exports = {
    getOrderHistory,
    filterOrders,
    getOrderById,
    getAllFavourites,
    getFavouriteById,
    createFavourite,
    updateFavourite,
    deleteFavourite
};