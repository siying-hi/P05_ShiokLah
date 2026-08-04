const patronProfileModel = require("../models/patronProfileModel");

// Get patron profile
// Retrieves the profile details of the logged-in patron
async function getPatronProfile(req, res) {

    try {

        const patron = await patronProfileModel.getPatronProfile(req.user.id);

        // Return 404 if the patron account cannot be found
        if (!patron) {

            return res.status(404).json({

                message: "Patron not found."

            });

        }

        return res.status(200).json(patron);

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Internal server error."

        });

    }

}

// Update patron profile
// Updates the profile details of the logged-in patron
async function updatePatronProfile(req, res) {

    try {

        const {
            username,
            firstName,
            lastName,
            email
        } = req.body;

        await patronProfileModel.updatePatronProfile(

            req.user.id,
            username,
            firstName,
            lastName,
            email

        );

        return res.json({

            message: "Profile updated successfully."

        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Internal server error."

        });

    }

}

// Delete patron account
// Permanently deletes the logged-in patron's account
async function deletePatronAccount(req, res) {

    try {

        const patronId = req.user.id;

        await patronProfileModel.deletePatronAccount(

            patronId

        );

        return res.status(200).json({

            message: "Account deleted successfully."

        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Internal server error."

        });

    }

}

module.exports = {

    getPatronProfile,
    updatePatronProfile,
    deletePatronAccount

};