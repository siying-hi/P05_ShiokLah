const express = require("express");
const router = express.Router();

const stallController = require("../controllers/stallController");

router.get("/:id", stallController.getStallsById);

module.exports = router;
