function validateRewardId(req, res, next) {

    const rewardId =
        Number(req.params.rewardId);

    if (
        !Number.isInteger(rewardId) ||
        rewardId <= 0
    ) {

        return res.status(400).json({
            message: "Invalid reward ID."
        });

    }

    next();

}


module.exports = {
    validateRewardId
};