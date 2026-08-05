const cardModel = require("../models/cardModel");

// Add card
// Creates a new payment card for the logged-in patron
async function addCard(req, res) {

    try {

        const patronId = req.user.id;

        const {
            cardholderName,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv
        } = req.body;

        // Save the new card after all request validation has passed
        await cardModel.addCard(
            patronId,
            cardholderName,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv
        );

        return res.status(201).json({

            message: "Visa card added successfully."

        });

    }
    catch (error) {

        console.error(error);

        if (error.message === "Card already exists.") {

            return res.status(409).json({

                message: "This card has already been added."

            });

        }

        return res.status(500).json({

            message: "Unable to add card."

        });

    }

}

// Get patron cards
// Retrieves all saved payment cards for the logged-in patron
async function getCardsByPatronId(req, res) {

    try {

        const patronId = req.user.id;

        const cards =
            await cardModel.getCardsByPatronId(patronId);

        res.json(cards);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Unable to load cards."

        });

    }

}

// Get card by ID
// Retrieves a specific payment card belonging to the logged-in patron
async function getCardById(req, res) {

    try {

        const patronId = req.user.id;

        const cardId = req.params.cardId;

        const card =
            await cardModel.getCardById(
                patronId,
                cardId
            );

        // Return 404 if the requested card does not exist or does not belong to the logged-in patron
        if (!card) {

            return res.status(404).json({

                message: "Card not found."

            });

        }

        return res.status(200).json(card);

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Unable to load card."

        });

    }

}

// Update card
// Updates an existing payment card for the logged-in patron
async function updateCard(req, res) {

    try {

        const patronId = req.user.id;

        const cardId = req.params.cardId;

        const {
            cardholderName,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv
        } = req.body;

        // Update only the selected card owned by the logged-in patron
        await cardModel.updateCard(
            patronId,
            cardId,
            cardholderName,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv
        );

        return res.status(200).json({

            message: "Card updated successfully."

        });

    }
    catch(error){

        console.error(error);

        // Return 404 if the requested card does not exist
        if (error.message === "Card not found.") {

            return res.status(404).json({

                message: "Card not found."

            });

        }

        return res.status(500).json({

            message: "Unable to update card."

        });

    }

}

// Set default card
// Marks the selected payment card as the patron's default card
async function setDefaultCard(req,res){

    try{

        const patronId = req.user.id;

        const cardId = req.params.cardId;

        // Replace the current default card with the selected card
        await cardModel.setDefaultCard(
            patronId,
            cardId
        );

        res.json({

            message:"Default payment method updated."

        });

    }
    catch(error){

        console.error(error);

        // Return 404 if the requested card does not exist
        if (error.message === "Card not found.") {

            return res.status(404).json({

                message: "Card not found."

            });

        }

        res.status(500).json({

            message:"Unable to set default card."

        });

    }

}

// Delete card
// Removes a payment card belonging to the logged-in patron
async function deleteCard(req,res){

    try{

        const patronId = req.user.id;

        const cardId = req.params.cardId;

        const deleted =
            await cardModel.deleteCard(
                patronId,
                cardId
            );

        // Inform the frontend if the card could not be found
        if(!deleted){

            return res.status(404).json({

                message:"Card not found."

            });

        }

        res.json({

            message:"Card deleted successfully."

        });

    }
    catch(error){

        console.error(error);

        res.status(500).json({

            message:"Unable to delete card."

        });

    }

}

// Get default card
// Retrieves the patron's default payment card if one exists
async function getDefaultCard(req,res){

    try{

        const patronId = req.user.id;

        const card =
            await cardModel.getDefaultCard(patronId);

        // Return a flag instead of an error so the frontend can decide whether to prompt the user to select a default card
        if(!card){

            return res.json({

                hasDefaultCard:false

            });

        }

        res.json({

            hasDefaultCard:true,

            card

        });

    }
    catch(error){

        console.error(error);

        res.status(500).json({

            message:"Unable to load default card."

        });

    }

}

module.exports = {

    addCard,
    getCardsByPatronId,
    getCardById,
    updateCard,
    setDefaultCard,
    deleteCard,
    getDefaultCard

};