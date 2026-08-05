function validateFavouriteItemId(req, res, next) {

    const itemId = Number(req.params.itemId);

    if (!Number.isInteger(itemId) || itemId <= 0) {

        return res.status(400).json({
            message: "Invalid menu item ID."
        });

    }

    next();

}

module.exports = {
    validateFavouriteItemId
};