const patronHomepageModel = require("../models/patronHomepageModel");
const seedUserFallback = require("../models/seedUserFallback");
const seedHygieneFallback = require("../models/seedHygieneFallback");

function isDatabaseUnavailable(error) {
    return ["ELOGIN", "ESOCKET", "ETIMEOUT"].includes(error.code);
}

// Get patron homepage
// Retrieves the logged-in patron's profile and all available stalls
async function getPatronHomepage(req, res) {

    try {

        // Retrieve the logged-in patron's information
        const patron = await patronHomepageModel.getPatron(
            req.user.id
        );

        // Retrieve all stalls displayed on the homepage
        const stalls = await patronHomepageModel.getStalls();

        return res.status(200).json({

            patron,
            stalls

        });

    }
    catch (error) {

        console.error(error);

        if (isDatabaseUnavailable(error)) {
            const patron = seedUserFallback.findById("patron", req.user.id);
            if (!patron) {
                return res.status(404).json({ message: "Patron account was not found." });
            }

            const stalls = seedHygieneFallback.getAllWithLatestGrade().map((stall) => ({
                stall_id: stall.stall_id,
                stall_name: stall.stall_name,
                image_name: stall.image_name,
                rating: stall.rating,
                cuisine_type: stall.cuisine_type,
                hygiene_grade: stall.hygiene_grade || null
            }));

            return res.status(200).json({
                patron: { first_name: patron.first_name || patron.username || "Guest" },
                stalls
            });
        }

        return res.status(500).json({

            message: "Internal server error."

        });

    }

}

module.exports = {

    getPatronHomepage
};
