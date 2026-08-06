const rewardsModel =
    require("../models/rewardsModel");


// Get rewards
async function getRewards(req, res) {

    try {

        const patronId = req.user.id;

        const rewards =
            await rewardsModel.getRewardsByPatron(
                patronId
            );

        res.json(rewards);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve rewards."
        });

    }

}


// Get points
async function getPoints(req, res) {

    try {

        const patronId = req.user.id;

const points =
    await rewardsModel.getPoints(
        patronId
    );

        res.json(points);

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve points."
        });

    }

}


// Daily check-in
async function dailyCheckIn(req, res) {

    try {

        const patronId = req.user.id;

        const result =
            await rewardsModel.dailyCheckIn(
                patronId
            );

        if (!result.checkedIn) {

            return res.status(400).json({
                message:
                    "You have already checked in today.",
                points: result.points
            });

        }

        res.json({
            message:
                "Daily check-in successful! You received 1 point.",
            points: result.points
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Daily check-in failed."
        });

    }

}


// Mark new reward notification as seen
async function markRewardAsSeen(req, res) {

    try {

        const patronId = req.user.id;

        const rewardId =
            Number(req.params.rewardId);

        const updated =
            await rewardsModel.markRewardAsSeen(
                rewardId,
                patronId
            );

        if (!updated) {

            return res.status(404).json({
                message: "Reward not found."
            });

        }

        res.json({
            message:
                "Reward notification updated."
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to update notification."
        });

    }

}

// Use and delete reward
async function useReward(req, res) {

    try {

        const patronId = req.user.id;

        const rewardId =
            Number(req.params.rewardId);

        const reward =
            await rewardsModel.getRewardForCheckout(
                rewardId,
                patronId
            );

        if (!reward) {

            return res.status(404).json({
                message:
                    "Reward is unavailable, expired or already used."
            });

        }

        const deleted =
            await rewardsModel.useReward(
                rewardId,
                patronId,
                Number(reward.points_required)
            );

        if (!deleted) {

            return res.status(404).json({
                message: "Reward could not be used."
            });

        }

        return res.status(200).json({
            message: "Reward used successfully."
        });

    }
    catch (error) {

        console.error(
            "Error using reward:",
            error
        );

        return res.status(500).json({
            message: "Unable to use reward."
        });

    }

}
async function claimSpinPrize(req, res) {

    try {

        const patronId =
            req.user.id;

        const prize =
            String(req.body.prize || "");

        const pointPrizes = {
            "1 Point": 1,
            "2 Points": 2,
            "5 Points": 5
        };

        if (pointPrizes[prize]) {

            const result =
                await rewardsModel.addSpinPoints(
                    patronId,
                    pointPrizes[prize]
                );

            return res.json({
                message:
                    `${pointPrizes[prize]} point(s) added successfully.`,
                points: result.points
            });

        }

        if (prize === "$2 Voucher") {

            const voucher =
                await rewardsModel.giveSpinVoucher(
                    patronId
                );

            return res.json({
                message:
                    "$2 voucher added successfully.",
                voucher
            });

        }

        if (
            prize === "Try Again" ||
            prize === "Better Luck"
        ) {

            return res.json({
                message:
                    "No reward received.",
                noReward: true
            });

        }

        return res.status(400).json({
            message:
                "Invalid Lucky Spin prize."
        });

    }
    catch (error) {

        console.error(
            "Lucky Spin error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to save Lucky Spin prize."
        });

    }
}
module.exports = {
    getRewards,
    claimSpinPrize,
    getPoints,
    dailyCheckIn,
    markRewardAsSeen,
    useReward,
    claimSpinPrize
};