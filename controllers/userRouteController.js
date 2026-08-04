//Routing for user webpages
const path = require("path");

//Login page
exports.showLogin = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/login.html"));
};

//Create account page
exports.showRegister = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/register.html"));
};

//Select a role page
exports.showSelectRole = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/select-role.html"));
};

//Find account to reset password page
exports.showFindAccount = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/find-account.html"));
};

//Confirm account after finding an account before resetting password page
exports.showConfirmAccount = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/confirm-account.html"));
};

//Reset password page
exports.showResetPassword = (req, res) => {
    res.sendFile(path.join(__dirname, "../public/user/reset-password.html"));
};