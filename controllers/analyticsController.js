// controllers/analyticsController.js
const analyticsModel = require("../models/analyticsModel");

// GET /analytics/popular-items
// async function getPopularItemsMonthly(req, res) {
//     try {
//         const items = await analyticsModel.getPopularItemsMonthly();
//         res.status(200).json(items);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Failed to retrieve popular items." });
//     }
// }

async function getTotalOrders(req, res) {
  try {
    const totalOrders = await analyticsModel.getTotalOrders();
    res.json({ total_orders: totalOrders });
  } catch (err) {
    console.error("Controller error in getTotalOrders:", err);
    res.status(500).json({ message: "Failed to retrieve total orders." });
  }
}


async function getTopOrderedItems(req, res) {
    try {
        const months = parseInt(req.params.months, 10);

        console.log("Months:", months);

        const items = await analyticsModel.getTop3ForPatron(months);

        console.log(items);

        res.json(items);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// GET /analytics/feedback
async function getFeedbackDistribution(req, res) {
    try {
        const feedback = await analyticsModel.getFeedbackDistribution();
        res.status(200).json(feedback);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve feedback distribution." });
    }
}

// GET /analytics/hygiene
async function getHygieneGrade(req, res) {
    try {
        const grades = await analyticsModel.getHygieneGrade();
        res.status(200).json(grades);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve hygiene grade timeline." });
    }
}

module.exports = {
    getTotalOrders,
    getTopOrderedItems,
    getFeedbackDistribution,
    getHygieneGrade
};
