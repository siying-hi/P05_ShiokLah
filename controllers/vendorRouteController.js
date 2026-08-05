const path = require("path");

exports.showPerformanceDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/vendor/performanceDashboard.html"));
};

exports.showVendorMenuItem = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/vendor/vendorMenuItem.html"));
};

exports.showVendorOrder = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/vendor/vendorOrder.html"));
};

exports.showVendorProfile = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/vendor/vendorProfile.html"));
};

exports.showRentalAgreement = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/vendor/rentalAgreement.html"));
};

exports.showStallHygiene = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/vendor/stallHygiene.html"));
};

exports.showCleaningSubmissions = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/vendor/cleaningSubmissions.html"));
};

exports.showVendorFoodHandlerCert = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/vendor/vendorFoodHandlerCert.html"));
};

exports.showVendorReviews = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/vendor/vendorReviews.html"));
};