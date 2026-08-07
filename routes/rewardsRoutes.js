const express = require("express");

const router = express.Router();

const rewardsController =
    require("../controllers/rewardsController");

const {
    verifyJWT,
    authorise
} = require("../middlewares/authMiddleware");

const {
    validateRewardId
} = require("../middlewares/rewardsValidation");


// Get logged-in patron's rewards
router.get(
    "/",
    verifyJWT,
    authorise(["patron"]),
    rewardsController.getRewards
);


// Get points
router.get(
    "/points",
    verifyJWT,
    authorise(["patron"]),
    rewardsController.getPoints
);


// Daily check-in
router.put(
    "/check-in",
    verifyJWT,
    authorise(["patron"]),
    rewardsController.dailyCheckIn
);

// Save Lucky Spin prize
router.post(
    "/spin",
    verifyJWT,
    authorise(["patron"]),
    rewardsController.claimSpinPrize
);
// Mark reward notification as seen
router.put(
    "/:rewardId/seen",
    verifyJWT,
    authorise(["patron"]),
    validateRewardId,
    rewardsController.markRewardAsSeen
);

// Use and delete a reward
router.delete(
    "/:rewardId/use",
    verifyJWT,
    authorise(["patron"]),
    validateRewardId,
    rewardsController.useReward
);
module.exports = router;