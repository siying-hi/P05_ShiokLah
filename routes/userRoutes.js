const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const userRouteController = require("../controllers/userRouteController");
const { verifyJWT } = require("../middlewares/authMiddleware");
const { validateRegister, validateLogin, validateFindAccount, validateVerifyCode, validateResetPassword } = require("../middlewares/userValidation");

router.get("/select-role", userRouteController.showSelectRole);

router.get("/login", userRouteController.showLogin);

router.get("/register", userRouteController.showRegister);

router.get("/find-account", userRouteController.showFindAccount);

router.get("/confirm-account", userRouteController.showConfirmAccount);

router.get("/reset-password", userRouteController.showResetPassword);

router.post(
    "/register",
    validateRegister,
    authController.register
);

router.post(
    "/login",
    validateLogin,
    authController.login
);

// Generate a new access token
router.post(
    "/refresh-token",
    authController.refreshToken
);

router.post(
    "/logout",
    verifyJWT,
    authController.logout
);

router.post(
    "/reset-password",
    validateResetPassword,
    authController.resetPassword
);

router.post(
    "/confirm-account", 
    validateVerifyCode,
    authController.verifyCode
);

router.post(
    "/find-account", 
    validateFindAccount,
    authController.findAccount
);

module.exports = router;
