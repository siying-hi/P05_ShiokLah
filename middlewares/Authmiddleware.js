// Reusable authentication and authorisation middleware
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Verify JWT access token
// Checks for a valid "Authorization: Bearer <token>" header
// If the token is valid, the decoded payload is attached to req.user
// Otherwise, returns HTTP 401 (Unauthorised)
async function verifyJWT(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {

        return res.status(401).json({

            message: "Access token required."

        });

    }

    const token =
        authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(

            token,
            process.env.ACCESS_TOKEN_SECRET

        );

        // Check whether the user is still logged in
        const storedRefreshToken =
            await userModel.getRefreshToken(

                decoded.role,
                decoded.id

            );

        // Logout removes the refresh token from the database
        // Therefore, no stored token means the access token should be rejected
        if (!storedRefreshToken) {

            return res.status(401).json({

                message:
                    "Session expired. Please log in again."

            });

        }

        req.user = decoded;

        next();

    }

    catch (error) {

        return res.status(401).json({

            message:
                "Invalid or expired access token."

        });

    }

}

// Role-based authorisation middleware
// Allows access only if the authenticated user's role is included in the allowedRoles array
// Returns HTTP 401 if the user is unauthenticated, or HTTP 403 if the user does not have permission
function authorise(allowedRoles) {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                message: "Unauthorised."

            });

        }

        if (!allowedRoles.includes(req.user.role)) {

            return res.status(403).json({

                message: "You do not have permission to access this resource."

            });

        }

        next();

    };

}

function requireOfficerLogin(req, res, next) {

    if (!req.session) {

        req.session = {};

    }

    if (

        !req.session.officerId &&
        process.env.DEV_BYPASS_AUTH === "true"

    ) {

        req.session.officerId = 1;

        return next();

    }

    if (!req.session.officerId) {

        return res.status(401).json({

            message: "Please log in as an NEA officer to continue."

        });

    }

    next();

}

module.exports = {

    verifyJWT,
    authorise,
    requireOfficerLogin

};