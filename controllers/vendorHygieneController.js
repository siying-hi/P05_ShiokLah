const vendorHygieneModel = require("../models/vendorHygieneModel");
const seedHygieneFallback = require("../models/seedHygieneFallback");

async function getVendorHygiene(req, res) {
  try {
    const data = await vendorHygieneModel.getVendorHygiene(req.user.id);
    if (!data.stall) {
      return res.status(404).json({ message: "No stall is linked to this vendor account." });
    }
    res.json(data);
  } catch (error) {
    if (["ELOGIN", "ESOCKET", "ETIMEOUT"].includes(error.code)) {
      const stall = seedHygieneFallback.getAllWithLatestGrade()
        .find((item) => Number(item.vendor_id) === Number(req.user.id));
      if (!stall) return res.status(404).json({ message: "No stall is linked to this vendor account." });

      const grades = seedHygieneFallback.getHistoryByStallId(stall.stall_id);
      return res.json({
        stall: { stall_id: stall.stall_id, stall_name: stall.stall_name, location: stall.location },
        grades
      });
    }

    res.status(500).json({ message: "Failed to load your stall hygiene grades.", error: error.message });
  }
}

module.exports = { getVendorHygiene };
