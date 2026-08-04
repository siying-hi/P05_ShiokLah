const favouriteModel =
    require("../models/favouriteModel");


// Get favourite item IDs
async function getFavouriteItemIds(req, res) {

    try {

        const patronId = req.user.id;

        const favourites =
            await favouriteModel.getFavouriteItemIds(
                patronId
            );

        const itemIds = favourites.map(
            favourite => favourite.item_id
        );

        res.json({
            itemIds: itemIds
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve favourites."
        });

    }

}


// Get all favourites
async function getAllFavourites(req, res) {

    try {

        const patronId = req.user.id;

        const favourites =
            await favouriteModel.getAllFavourites(
                patronId
            );

        res.json({
            favourites: favourites
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve favourites."
        });

    }

}


// Add favourite
async function addFavourite(req, res) {

    try {

        const patronId = req.user.id;
        const itemId = Number(req.params.itemId);

        const added =
            await favouriteModel.addFavourite(
                patronId,
                itemId
            );

        if (!added) {

            return res.status(400).json({
                message: "Menu item is already in favourites."
            });

        }

        res.status(201).json({
            message: "Menu item added to favourites."
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to add favourite."
        });

    }

}


// Delete favourite
async function deleteFavourite(req, res) {

    try {

        const patronId = req.user.id;
        const itemId = Number(req.params.itemId);

        const deleted =
            await favouriteModel.deleteFavourite(
                patronId,
                itemId
            );

        if (!deleted) {

            return res.status(404).json({
                message: "Favourite not found."
            });

        }

        res.json({
            message: "Favourite removed successfully."
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to remove favourite."
        });

    }

}


module.exports = {
    getFavouriteItemIds,
    getAllFavourites,
    addFavourite,
    deleteFavourite
};