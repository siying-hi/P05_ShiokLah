const express = require("express");

const favouriteController =
    require("../controllers/favouriteController");

const {
    validateFavouriteItemId
} = require("../middlewares/favouriteValidation");

const {
    verifyJWT,
    authorise
} = require("../middlewares/authMiddleware");

const router = express.Router();


// Get all favourite menu items
router.get(
    "/",
    verifyJWT,
    authorise(["patron"]),
    favouriteController.getAllFavourites
);


// Get favourite item IDs
router.get(
    "/ids",
    verifyJWT,
    authorise(["patron"]),
    favouriteController.getFavouriteItemIds
);


// Add favourite
router.post(
    "/:itemId",
    verifyJWT,
    authorise(["patron"]),
    validateFavouriteItemId,
    favouriteController.addFavourite
);


// Delete favourite
router.delete(
    "/:itemId",
    verifyJWT,
    authorise(["patron"]),
    validateFavouriteItemId,
    favouriteController.deleteFavourite
);


module.exports = router;