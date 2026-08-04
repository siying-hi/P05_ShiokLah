const express = require("express");

const router = express.Router();

const creditController = require("../controllers/creditController");

router.get("/credits",creditController.getCreditsPage);

module.exports = router;