const operatorModel = require("../models/operatorAnalyticsModel");



function getDateRange(range) {
  const today = new Date();
  let startDate, endDate = new Date(today);

  if (range === "month") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (range === "3months") {
    startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  } else if (range === "6months") {
    startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  } else {
    startDate = new Date(2000, 0, 1); // default
  }

  return { startDate, endDate };
}


async function getTopStalls(req, res) {
  try {
    const { range } = req.query; // e.g. ?range=month
    const { startDate, endDate } = getDateRange(range);

    const stalls = await operatorModel.getTopRankedStalls(startDate, endDate);
    res.status(200).json(stalls);
  } catch (err) {
    console.error("Operator Controller error:", err);
    res.status(500).json({ message: "Failed to retrieve top stalls." });
  }
}


// async function getTotalOrders(req, res) {
//   try {
//     const totalOrders = await operatorModel.getTotalOrders();
//     res.status(200).json({ total_orders: totalOrders });
//   } catch (err) {
//     console.error("Operator Controller error:", err);
//     res.status(500).json({ message: "Failed to retrieve total orders." });
//   }
// }

async function getFeedbackDistribution(req, res) {
  try {
    const { range } = req.query; // e.g. ?range=month
    const { startDate, endDate } = getDateRange(range);

    const feedback = await operatorModel.getFeedbackDistribution(startDate, endDate);
    res.status(200).json(Array.isArray(feedback) ? feedback : []);
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Failed to retrieve feedback" });
  }
}


async function getHygieneGrade(req, res) {
  try {
    const grades = await operatorModel.getHygieneGrade();
    res.status(200).json(Array.isArray(grades) ? grades : []);
  } catch (err) {
    console.error("Hygiene error:", err);
    res.status(500).json({ message: "Failed to retrieve hygiene grades" });
  }
}



module.exports = {
  getDateRange,
  // getTopOrderedItems,
  getTopStalls,
  // getTotalOrders,
  getFeedbackDistribution,
  getHygieneGrade
};
