const rentalAgreementModel = require("../models/operatorRentalAgreementModel");


exports.getAllRentalAgreements = async (req, res) => {

    try {

        const agreements =
            await rentalAgreementModel.getAllRentalAgreements();


        res.status(200).json(agreements);


    } catch(error) {

        console.error(error);


        res.status(500).json({
            error: "Failed to retrieve rental agreements."
        });

    }

};

// Update rental agreement status
exports.updateRentalStatus = async (req, res) => {

    try {

        const agreementId =
            req.params.id;


        const {
            status
        } = req.body;



        if (
            !["Active", "Rejected"].includes(status)
        ) {

            return res.status(400).json({

                error:
                    "Invalid rental agreement status."

            });

        }



        const updatedAgreement =
            await rentalAgreementModel.updateRentalStatus(
                agreementId,
                status
            );



        if (!updatedAgreement) {

            return res.status(404).json({

                error:
                    "Rental agreement not found."

            });

        }



        res.status(200).json({

            message:
                "Rental agreement status updated successfully.",

            agreement:
                updatedAgreement

        });


    } catch(error) {


        console.error(error);


        res.status(500).json({

            error:
                "Failed to update rental agreement status."

        });


    }

};