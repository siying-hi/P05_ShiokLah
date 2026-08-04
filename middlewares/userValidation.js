// Import Joi for validation
const Joi = require("joi");

// Validation schema for registering a patron, vendor or operator
// Requires all mandatory account details to be provided
const generalRegisterSchema = Joi.object({

    role: Joi.string()
        .valid("patron", "vendor", "operator")
        .required()
        .messages({

            "any.required": "Role is required.",
            "any.only": "Role must be patron, vendor, operator or officer." //Standardise error message for invalid role between generalRegisterSchema and officerRegisterSchema

        }),

    firstName: Joi.string()
        .max(50)
        .required()
        .messages({

            "string.empty": "First name cannot be empty.",
            "string.max": "First name cannot exceed 50 characters.",
            "any.required": "First name is required."

        }),

    lastName: Joi.string()
        .max(50)
        .required()
        .messages({

            "string.empty": "Last name cannot be empty.",
            "string.max": "Last name cannot exceed 50 characters.",
            "any.required": "Last name is required."

        }),

    username: Joi.string()
        .pattern(/^[A-Za-z0-9._]+$/)
        .max(50)
        .required()
        .messages({

            "string.empty": "Username cannot be empty.",
            "string.pattern.base": "Username can only contain letters, numbers, '.' and '_'.",
            "string.max": "Username cannot exceed 50 characters.",
            "any.required": "Username is required."

        }),

    email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({

            "string.empty": "Email cannot be empty.",
            "string.email": "Please enter a valid email address.",
            "string.max": "Email cannot exceed 100 characters.",
            "any.required": "Email is required."

        }),

    password: Joi.string()
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/)
        .required()
        .messages({

            "string.empty": "Password cannot be empty.",
            "string.pattern.base": "Password must be at least 9 characters long and contain both letters and numbers.",
            "any.required": "Password is required."

        })

});

// Validation schema for registering an NEA officer
// Requires officer-specific account details and optional profile information
const officerRegisterSchema = Joi.object({

    role: Joi.string()
        .valid("officer")
        .required()
        .messages({

            "any.required": "Role is required.",
            "any.only": "Role must be patron, vendor, operator or officer." //Standardise error message for invalid role between generalRegisterSchema and officerRegisterSchema

        }),

    fullName: Joi.string()
        .max(100)
        .required()
        .messages({

            "string.empty": "Full name cannot be empty.",
            "string.max": "Full name cannot exceed 100 characters.",
            "any.required": "Full name is required."

        }),

    username: Joi.string()
        .pattern(/^[A-Za-z0-9._]+$/)
        .max(50)
        .required()
        .messages({

            "string.empty": "Username cannot be empty.",
            "string.pattern.base": "Username can only contain letters, numbers, '.' and '_'.",
            "string.max": "Username cannot exceed 50 characters.",
            "any.required": "Username is required."

        }),

    email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({

            "string.empty": "Email cannot be empty.",
            "string.email": "Please enter a valid email address.",
            "string.max": "Email cannot exceed 100 characters.",
            "any.required": "Email is required."

        }),

    password: Joi.string()
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/)
        .required()
        .messages({

            "string.empty": "Password cannot be empty.",
            "string.pattern.base": "Password must be at least 9 characters long and contain both letters and numbers.",
            "any.required": "Password is required."

        }),

    phone: Joi.string()
        .max(20)
        .allow(null, "")
        .messages({

            "string.max": "Phone number cannot exceed 20 characters."

        }),

    assignedArea: Joi.string()
        .max(100)
        .allow(null, "")
        .messages({

            "string.max": "Assigned area cannot exceed 100 characters."

        }),

    profileImage: Joi.string()
        .max(255)
        .allow(null, "")
        .messages({

            "string.max": "Profile image path cannot exceed 255 characters."

        })

});

// Validation schema for user login
// Requires a valid role, username and password
const loginSchema = Joi.object({

    role: Joi.string()
        .valid("patron", "vendor", "operator", "officer")
        .required()
        .messages({

            "any.required": "Role is required.",
            "any.only": "Role must be patron, vendor, operator or officer."

        }),

    username: Joi.string()
        .max(50)
        .required()
        .messages({

            "string.empty": "Username cannot be empty.",
            "string.max": "Username cannot exceed 50 characters.",
            "any.required": "Username is required."

        }),

    password: Joi.string()
        .required()
        .messages({

            "string.empty": "Password cannot be empty.",
            "any.required": "Password is required."

        })

});

// Validation schema for finding an account
// Requires a valid role and username
const findAccountSchema = Joi.object({

    role: Joi.string()
        .valid(
            "patron",
            "vendor",
            "operator",
            "officer"
        )
        .required()
        .messages({

            "any.required":
                "Please select a role.",

            "any.only":
                "Invalid role."

        }),

    username: Joi.string()
        .trim()
        .min(3)
        .max(50)
        .required()
        .messages({

            "string.empty": "Username is required.",
            "string.min": "Username must be at least 3 characters.",
            "string.max": "Username cannot exceed 50 characters.",
            "any.required": "Username is required."

        })

});

// Validation schema for verifying a password reset code
// Requires a valid verification code and the expected verification code
const verifyCodeSchema = Joi.object({

    enteredCode: Joi.string()
        .trim()
        .pattern(/^\d{6}$/)
        .required()
        .messages({

            "string.empty":
                "Verification code is required.",

            "string.pattern.base":
                "Verification code must be exactly 6 digits."

        }),

    expectedCode: Joi.string()
        .required()

});

// Validation schema for resetting a password
// Requires a valid role, username and matching passwords
const resetPasswordSchema = Joi.object({

    role: Joi.string()
        .valid("patron", "vendor", "operator", "officer")
        .required()
        .messages({

            "any.required": "Role is required.",
            "any.only": "Role must be patron, vendor, operator or officer."

        }),

    username: Joi.string()
        .trim()
        .required()
        .messages({

            "string.empty": "Username is required.",
            "any.required": "Username is required."

        }),

    newPassword: Joi.string()
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/)
        .required()
        .messages({

            "string.empty": "Password is required.",
            "string.pattern.base":
                "Password must be at least 9 characters and contain letters and numbers only.",
            "any.required": "Password is required."

        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({

            "any.only": "Passwords do not match.",
            "string.empty": "Please confirm your password.",
            "any.required": "Please confirm your password."

        })

});

// Middleware: validateRegister
// Validates the request body before registering a new user
// Selects the appropriate validation schema based on the user's role
function validateRegister(req, res, next) {

    const { role } = req.body;

    const schema =
        role === "officer"
            ? officerRegisterSchema
            : generalRegisterSchema;

    const { error } = schema.validate(req.body, {

        abortEarly: false

    });

    if (error) {

        const messages = error.details.map(d => d.message);

        return res.status(400).json({

            errors: messages

        });

    }

    next();

}

// Middleware: validateLogin
// Validates the request body before authenticating a user
// Ensures all required login credentials are provided
function validateLogin(req, res, next) {

    const { error } = loginSchema.validate(req.body, {

        abortEarly: false

    });

    if (error) {

        const messages = error.details.map(d => d.message);

        return res.status(400).json({

            errors: messages

        });

    }

    next();

}

// Middleware: validateFindAccount
// Validates the request body before searching for an account
// Ensures a valid role and username are provided
function validateFindAccount(req, res, next) {

    const { error } = findAccountSchema.validate(req.body, {

        abortEarly: false

    });

    if (error) {

        return res.status(400).json({

            errors: error.details.map(detail => detail.message)

        });

    }

    next();

}

// Middleware: validateVerifyCode
// Validates the request body before verifying the reset code
// Ensures the verification code is in the correct format
function validateVerifyCode(req, res, next) {

    const { error } = verifyCodeSchema.validate(req.body, {

        abortEarly: false

    });

    if (error) {

        return res.status(400).json({

            errors: error.details.map(detail => detail.message)

        });

    }

    next();

}

// Middleware: validateResetPassword
// Validates the request body before resetting a user's password
// Ensures all required fields are valid and both passwords match
function validateResetPassword(req, res, next) {

    const { error } = resetPasswordSchema.validate(

        req.body,

        {

            abortEarly: false

        }

    );

    if (error) {

        return res.status(400).json({

            errors: error.details.map(detail => detail.message)

        });

    }

    next();

}

module.exports = {

    validateRegister,
    validateLogin,
    validateFindAccount,
    validateVerifyCode,
    validateResetPassword

};