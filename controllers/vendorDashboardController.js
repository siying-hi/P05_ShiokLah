const vendorModel = require("../models/vendorModel");
const menuItemModel = require("../models/menuItemModel");
const dashboardModel = require("../models/vendorPerformanceDashboard");

exports.getTotalOrders = async (req, res) => {
    try {
        const result = await dashboardModel.getTotalOrders();

        res.status(200).json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve total orders."
        });
    }
};

exports.getCustomerFrequency = async (req, res) => {

    try {

        const vendorId = req.user.id;

        const stallId = await vendorModel.getStallIdByVendorId(vendorId);

        const filter = req.query.filter || "year";

        const data = await dashboardModel.getCustomerFrequency(stallId, filter);

        res.json({
            labels: data.map(x => x.label),
            values: data.map(x => x.value)
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to retrieve customer frequency."
        });

    }

};

exports.getMenuPerformance = async(req,res)=>{

    try{

        const vendorId = req.user.id;

        const stallId = await vendorModel.getStallIdByVendorId(vendorId);


        const {
            startDate,
            endDate
        } = req.query;


        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);


        const performance =
            await dashboardModel.getMenuPerformance(
                stallId,
                startDate,
                endDate
            );


        res.status(200).json(performance);


    }catch(error){

        console.log(error);

        res.status(500).json({
            message:"Failed to retrieve menu performance"
        });

    }

};

exports.getAverageRevenue = async(req,res)=>{

    try{
         console.log("USER:", req.user);

    console.log(
        "QUERY:",
        req.query
    );


        const vendorId = req.user.id;


        const stallId =
            await vendorModel.getStallIdByVendorId(vendorId);


        const {
            startDate,
            endDate
        } = req.query;


        const revenue =
            await dashboardModel.getAverageRevenue(
                stallId,
                startDate,
                endDate
            );


        res.status(200).json(revenue);



    }catch(error){

        console.log(error);


        res.status(500).json({
            message:"Failed to retrieve average revenue"
        });

    }

};