const patronMenuModel = require("../models/patronMenuModel");
const seedUserFallback = require("../models/seedUserFallback");
const seedHygieneFallback = require("../models/seedHygieneFallback");

function isDatabaseUnavailable(error) {
    return ["ELOGIN", "ESOCKET", "ETIMEOUT"].includes(error.code);
}

function getSeedStallMenu(stallId) {
    const stall = seedHygieneFallback.getAllWithLatestGrade()
        .find((item) => Number(item.stall_id) === Number(stallId));
    if (!stall) return null;

    const menuItems = seedUserFallback.getRows("MenuItem")
        .map((item, index) => ({
            item_id: Number(item.item_id) || index + 1,
            item_name: item.item_name,
            price: Number(item.price),
            food_description: item.food_description,
            allergen_info: item.allergen_info,
            estimated_waiting_time: Number(item.estimated_waiting_time),
            image_name: item.image_name,
            visibility: item.visibility === "" ? 1 : Number(item.visibility),
            stall_id: Number(item.stall_id)
        }))
        .filter((item) => item.stall_id === Number(stallId) && item.visibility === 1);

    return {
        stall: {
            stall_id: stall.stall_id,
            stall_name: stall.stall_name,
            image_name: stall.image_name || "default-stall.jpg",
            rating: stall.rating,
            cuisine_type: stall.cuisine_type,
            hygiene_grade: stall.hygiene_grade || null,
            hygiene_score: stall.score ?? null,
            hygiene_inspection_date: stall.inspection_date || null
        },
        menuItems
    };
}

// Get stall menu
// Retrieves a stall and all menu items available for that stall
async function getStallMenu(req, res) {

    try {

        const stallId = req.params.stallId;

        // Retrieve the requested stall
        const stall =
            await patronMenuModel.getStall(stallId);

        if (!stall) {

            return res.status(404).json({

                message: "Stall not found."

            });

        }

        // Retrieve all menu items belonging to the stall
        const menuItems =
            await patronMenuModel.getMenuItems(stallId);

        res.json({

            stall,
            menuItems

        });

    }
    catch (error) {

        console.error(error);

        if (isDatabaseUnavailable(error)) {
            const fallback = getSeedStallMenu(req.params.stallId);
            if (!fallback) {
                return res.status(404).json({ message: "Stall not found." });
            }
            return res.json(fallback);
        }

        res.status(500).json({

            message: "Internal server error."

        });

    }

}

module.exports = {

    getStallMenu
};
