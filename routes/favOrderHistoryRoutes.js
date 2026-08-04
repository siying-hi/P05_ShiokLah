const express = require("express");

const router = express.Router();

const controller = require("../controllers/orderHistoryController");

const validation = require("../middlewares/favOrderHistoryValidation");

const { verifyJWT, authorise } = require("../middlewares/authMiddleware");


// Get all
router.get(
  "/",
  verifyJWT,
  authorise("patron"),
  controller.getAllFavourites
);


/**
 * @swagger
 * /api/order-history-favourites/{favouriteId}:
 *   get:
 *     summary: Get a favourite order by ID
 *     tags:
 *       - Order History Favourites
 *     parameters:
 *       - name: favouriteId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Favourite order found
 *       404:
 *         description: Favourite not found
 */
//Get by id
router.get(
  "/:id",
  verifyJWT,
  authorise("patron"),
  controller.getFavouriteById
);

// CREATE
router.post(
  "/",
  verifyJWT,
  authorise("patron"), 
  validation.validateCreateFavourite,
  controller.createFavourite
);

//UPDATE
router.put(
  "/:id",
  verifyJWT,
  authorise("patron"),
  validation.validateUpdateFavourite,
  controller.updateFavourite
);

// DELETE
router.delete(
  "/:id",
  verifyJWT,
  authorise("patron"),
  controller.deleteFavourite
);

module.exports = router;