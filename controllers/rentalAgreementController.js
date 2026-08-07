const vendorController = require("./vendorController");
const rentalAgreementModel = require("../models/rentalAgreementModel");



exports.getRentalAgreements = async (req, res) => {

    try {
        const stallId = await vendorController.getVendorStallId(req);

        const agreements = await rentalAgreementModel.getRentalAgreements(stallId);

        res.status(200).json(agreements);

    } catch(error) {

        console.error(error);

        res.status(500).json({
            error: "Failed to retrieve rental agreements."
        });

    }

};

exports.getRentalAgreementById = async (
    req,
    res
) => {

    try {

        const id =
            req.params.id;


        const agreement =
            await rentalAgreementModel.getRentalAgreementById(id);


        if (!agreement) {

            return res.status(404).json({
                error:
                "Rental agreement not found."
            });

        }


        res.status(200).json(
            agreement
        );


    } catch(error) {

        console.error(error);

        res.status(500).json({
            error:
            "Failed to retrieve rental agreement."
        });

    }

};

exports.renewRentalAgreement = async (req,res)=>{

    try {

        const stallId =
            await vendorController.getVendorStallId(req);


        const {
            startDate,
            endDate
        } = req.body;


        if(!startDate || !endDate){

            return res.status(400).json({
                error:"Start date and end date are required."
            });

        }


        const agreement =
            await rentalAgreementModel.renewRentalAgreement(
                stallId,
                startDate,
                endDate
            );


        res.status(201).json({

            message:
            "Rental agreement renewed successfully.",

            aid:
            agreement.aid

        });


    }
    catch(error){

        console.error(error);


        res.status(400).json({
            error:error.message
        });

    }

};

exports.updateRentalAgreement = async (req, res) => {

    try {

        const id = req.params.id;

        const {
            tradeType
        } = req.body;


        const agreement = await rentalAgreementModel.updateRentalAgreement(
            id,
            tradeType
        );


        res.status(200).json({

            message: "Rental agreement updated successfully.",

            agreement

        });


    } catch(error) {

        console.error(error);

        res.status(400).json({
            error: error.message
        });

    }

};