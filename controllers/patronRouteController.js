//Routing for patron webpages
const path = require("path");

// Main page
exports.showPatronHomepage = (req, res) => {
  res.sendFile(path.join(__dirname, "../public/patron/index.html"));
};

//Stall menu page
exports.showStallMenu = (req, res) => {
  res.sendFile(path.join(__dirname, "../public/patron/stall-menu.html"));
};

//Patron profile page
exports.showPatronProfile = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/patron/patron-profile.html"));
};

//Checkout page
exports.showPatronCheckout = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/patron/checkout.html"));
};

//Payment failed page
exports.showPaymentFailed = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/patron/payment-failed.html"));
};

//Payment success page
exports.showPaymentSuccess = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/patron/payment-success.html"));
};

exports.showOrderHistory = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../public/patron/OrderHistory.html")
    );
}