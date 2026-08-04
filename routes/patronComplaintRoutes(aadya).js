const express = require("express");

const complaintController =
    require("../controllers/complaintController");

const {
    verifyJWT
} = require("../middlewares/authMiddleware");
const {
    validateComplaint
} = require("../middlewares/complaintsValidation");


const router = express.Router();
function requirePatron(req, res, next) {

    const role = String(
        req.user.role
    ).trim().toLowerCase();

    if (role !== "patron") {

        return res.status(403).json({
            message:
                "Only patrons can access complaints."
        });

    }

    next();

}


router.get(
    "/stalls",
    verifyJWT,
    requirePatron,
    complaintController.getStalls
);

router.get(
    "/stalls/:stallId/menu-items",
    verifyJWT,
    requirePatron,
    complaintController.getMenuItems
);


router.get(
    "/",
    verifyJWT,
    requirePatron,
    complaintController.getComplaintHistory
);


router.post(
    "/",
    verifyJWT,
    requirePatron,
    validateComplaint,
    complaintController.createComplaint
);


router.put(
    "/:complaintId",
    verifyJWT,
    requirePatron,
    validateComplaint,
    complaintController.updateComplaint
);


router.delete(
    "/:complaintId",
    verifyJWT,
    requirePatron,
    complaintController.deleteComplaint
);


module.exports = router;