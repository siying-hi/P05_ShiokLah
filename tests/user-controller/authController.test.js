jest.mock("jsonwebtoken");
jest.mock("bcryptjs");

jest.mock("../../models/userModel", () => ({

    login: jest.fn(),
    register: jest.fn(),
    saveRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn(),
    findAccount: jest.fn(),
    resetPassword: jest.fn()

}));

jest.mock("../../models/seedOfficerFallback", () => ({

    findOfficerByLogin: jest.fn(),
    findOfficerByUsername: jest.fn()

}));

jest.mock("../../models/seedUserFallback", () => ({

    findByUsername: jest.fn()

}));


const jwt =
    require("jsonwebtoken");

const bcrypt =
    require("bcryptjs");

const userModel =
    require("../../models/userModel");

const seedOfficerFallback =
    require("../../models/seedOfficerFallback");

const seedUserFallback =
    require("../../models/seedUserFallback");

const authController =
    require("../../controllers/authController");


// Create mock response object
function createMockResponse() {

    const res = {

        status: jest.fn(),
        json: jest.fn(),
        clearCookie: jest.fn()

    };

    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);

    return res;

}


// Create mock session object
function createMockSession() {

    return {

        destroy: jest.fn(callback => {

            callback(null);

        })

    };

}


// Login controller tests
describe("AuthController.login", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            body: {

                role: "patron",
                username: "alice",
                password: "password123"

            },

            session: createMockSession()

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful patron login ---
    it("should return tokens for successful patron login", async () => {

        userModel.login.mockResolvedValue({

            id: 1,
            username: "alice",
            password: "hashedPassword"

        });

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign
            .mockReturnValueOnce("accessToken123")
            .mockReturnValueOnce("refreshToken123");

        userModel.saveRefreshToken
            .mockResolvedValue();

        await authController.login(req, res);

        expect(userModel.login)
            .toHaveBeenCalledWith(
                "patron",
                "alice"
            );

        expect(bcrypt.compare)
            .toHaveBeenCalledWith(
                "password123",
                "hashedPassword"
            );

        expect(jwt.sign)
            .toHaveBeenNthCalledWith(

                1,

                {
                    id: 1,
                    role: "patron"
                },

                expect.any(String),

                {
                    expiresIn: "15m"
                }

            );

        expect(jwt.sign)
            .toHaveBeenNthCalledWith(

                2,

                {
                    id: 1,
                    role: "patron"
                },

                expect.any(String),

                {
                    expiresIn: "7d"
                }

            );

        expect(userModel.saveRefreshToken)
            .toHaveBeenCalledWith(

                "patron",
                1,
                "refreshToken123"

            );

        expect(req.session.patronId)
            .toBe(1);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Login successful.",
                role: "patron",
                accessToken: "accessToken123",
                refreshToken: "refreshToken123"

            });

    });


    // --- Test Case 2: Successful vendor login ---
    it("should store vendor ID in session", async () => {

        req.body = {

            role: "vendor",
            username: "vendor1",
            password: "password123"

        };

        userModel.login.mockResolvedValue({

            id: 2,
            username: "vendor1",
            password: "hashedPassword"

        });

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign
            .mockReturnValueOnce("accessToken")
            .mockReturnValueOnce("refreshToken");

        userModel.saveRefreshToken
            .mockResolvedValue();

        await authController.login(req, res);

        expect(userModel.login)
            .toHaveBeenCalledWith(
                "vendor",
                "vendor1"
            );

        expect(req.session.vendorId)
            .toBe(2);

        expect(userModel.saveRefreshToken)
            .toHaveBeenCalledWith(

                "vendor",
                2,
                "refreshToken"

            );

        expect(res.status)
            .toHaveBeenCalledWith(200);

    });


    // --- Test Case 3: Successful database officer login ---
    it("should login an officer using the database account", async () => {

        req.body = {

            role: "officer",
            username: "officer1",
            password: "officerPassword"

        };

        userModel.login.mockResolvedValue({

            id: 5,
            username: "officer1",
            password: "hashedOfficerPassword"

        });

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign
            .mockReturnValueOnce("officerAccessToken")
            .mockReturnValueOnce("officerRefreshToken");

        userModel.saveRefreshToken
            .mockResolvedValue();

        await authController.login(req, res);

        expect(userModel.login)
            .toHaveBeenCalledWith(

                "officer",
                "officer1"

            );

        expect(seedOfficerFallback.findOfficerByLogin)
            .not.toHaveBeenCalled();

        expect(bcrypt.compare)
            .toHaveBeenCalledWith(

                "officerPassword",
                "hashedOfficerPassword"

            );

        expect(req.session.officerId)
            .toBe(5);

        expect(userModel.saveRefreshToken)
            .toHaveBeenCalledWith(

                "officer",
                5,
                "officerRefreshToken"

            );

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Login successful.",
                role: "officer",
                accessToken: "officerAccessToken",
                refreshToken: "officerRefreshToken"

            });

    });


    // --- Test Case 4: Seeded officer used if database officer is absent ---
    it("should use seeded officer if no database officer is found", async () => {

        req.body = {

            role: "officer",
            username: "seedOfficer",
            password: "officerPassword"

        };

        userModel.login.mockResolvedValue(null);

        seedOfficerFallback.findOfficerByLogin
            .mockReturnValue({

                id: 8,
                username: "seedOfficer",
                password: "hashedSeedPassword"

            });

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign
            .mockReturnValueOnce("seedAccessToken")
            .mockReturnValueOnce("seedRefreshToken");

        userModel.saveRefreshToken
            .mockResolvedValue();

        await authController.login(req, res);

        expect(userModel.login)
            .toHaveBeenCalledWith(

                "officer",
                "seedOfficer"

            );

        expect(seedOfficerFallback.findOfficerByLogin)
            .toHaveBeenCalledWith(
                "seedOfficer"
            );

        expect(bcrypt.compare)
            .toHaveBeenCalledWith(

                "officerPassword",
                "hashedSeedPassword"

            );

        expect(req.session.officerId)
            .toBe(8);

        expect(res.status)
            .toHaveBeenCalledWith(200);

    });


    // --- Test Case 5: Seeded officer hardcoded password ---
    it("should allow the seeded officer hardcoded password", async () => {

        req.body = {

            role: "officer",
            username: "seedOfficer",
            password: "nea1230984"

        };

        userModel.login.mockResolvedValue(null);

        seedOfficerFallback.findOfficerByLogin
            .mockReturnValue({

                id: 8,
                username: "seedOfficer",
                password: "differentPassword"

            });

        bcrypt.compare.mockResolvedValue(false);

        jwt.sign
            .mockReturnValueOnce("seedAccessToken")
            .mockReturnValueOnce("seedRefreshToken");

        userModel.saveRefreshToken
            .mockResolvedValue();

        await authController.login(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(req.session.officerId)
            .toBe(8);

    });


    // --- Test Case 6: User not found ---
    it("should return 401 if user is not found", async () => {

        userModel.login.mockResolvedValue(null);

        await authController.login(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Invalid username or password."

            });

        expect(bcrypt.compare)
            .not.toHaveBeenCalled();

        expect(userModel.saveRefreshToken)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 7: Officer not found in database or fallback ---
    it("should return 401 if officer is not found", async () => {

        req.body = {

            role: "officer",
            username: "missingOfficer",
            password: "password123"

        };

        userModel.login.mockResolvedValue(null);

        seedOfficerFallback.findOfficerByLogin
            .mockReturnValue(null);

        await authController.login(req, res);

        expect(seedOfficerFallback.findOfficerByLogin)
            .toHaveBeenCalledWith(
                "missingOfficer"
            );

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Invalid username or password."

            });

    });


    // --- Test Case 8: Incorrect password ---
    it("should return 401 if password is incorrect", async () => {

        userModel.login.mockResolvedValue({

            id: 1,
            password: "hashedPassword"

        });

        bcrypt.compare.mockResolvedValue(false);

        await authController.login(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Invalid username or password."

            });

        expect(userModel.saveRefreshToken)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 9: Database unavailable with patron fallback ---
    it("should use seeded user when database is unavailable", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ESOCKET";

        userModel.login.mockRejectedValue(
            databaseError
        );

        seedUserFallback.findByUsername
            .mockReturnValue({

                id: 8,
                username: "alice",
                password: "seededPassword"

            });

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign
            .mockReturnValueOnce("fallbackAccessToken")
            .mockReturnValueOnce("fallbackRefreshToken");

        userModel.saveRefreshToken
            .mockRejectedValue(databaseError);

        await authController.login(req, res);

        expect(seedUserFallback.findByUsername)
            .toHaveBeenCalledWith(

                "patron",
                "alice"

            );

        expect(req.session.patronId)
            .toBe(8);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Login successful.",
                role: "patron",
                accessToken: "fallbackAccessToken",
                refreshToken: "fallbackRefreshToken"

            });

    });


    // --- Test Case 10: Database unavailable with officer fallback ---
    it("should use seeded officer when database is unavailable", async () => {

        req.body = {

            role: "officer",
            username: "officer1",
            password: "officerPassword"

        };

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ETIMEOUT";

        userModel.login.mockRejectedValue(
            databaseError
        );

        seedOfficerFallback.findOfficerByUsername
            .mockReturnValue({

                id: 9,
                username: "officer1",
                password: "hashedSeedPassword"

            });

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign
            .mockReturnValueOnce("officerAccessToken")
            .mockReturnValueOnce("officerRefreshToken");

        userModel.saveRefreshToken
            .mockRejectedValue(databaseError);

        await authController.login(req, res);

        expect(seedOfficerFallback.findOfficerByUsername)
            .toHaveBeenCalledWith(
                "officer1"
            );

        expect(req.session.officerId)
            .toBe(9);

        expect(res.status)
            .toHaveBeenCalledWith(200);

    });


    // --- Test Case 11: Fallback account not found ---
    it("should return 401 if fallback account is not found", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ETIMEOUT";

        userModel.login.mockRejectedValue(
            databaseError
        );

        seedUserFallback.findByUsername
            .mockReturnValue(null);

        await authController.login(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Invalid username or password."

            });

    });


    // --- Test Case 12: Incorrect fallback password ---
    it("should return 401 if fallback password is incorrect", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ELOGIN";

        userModel.login.mockRejectedValue(
            databaseError
        );

        seedUserFallback.findByUsername
            .mockReturnValue({

                id: 8,
                username: "alice",
                password: "seededPassword"

            });

        bcrypt.compare.mockResolvedValue(false);

        await authController.login(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(401);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Invalid username or password."

            });

    });


    // --- Test Case 13: Unexpected login error ---
    it("should return 500 for unexpected login error", async () => {

        userModel.login.mockRejectedValue(

            new Error("Unexpected error")

        );

        await authController.login(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Internal server error."

            });

    });

});


// Register controller tests
describe("AuthController.register", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            body: {

                role: "patron",
                username: "alice",
                password: "password123",
                email: "alice@email.com",
                firstName: "Alice",
                lastName: "Tan"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Username already exists ---
    it("should return 409 if username already exists", async () => {

        userModel.login.mockResolvedValue({

            id: 1,
            username: "alice"

        });

        await authController.register(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(409);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Username already exists."

            });

        expect(bcrypt.hash)
            .not.toHaveBeenCalled();

        expect(userModel.register)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 2: Successful patron registration ---
    it("should register patron successfully", async () => {

        userModel.login.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue(
            "hashedPassword"
        );

        userModel.register.mockResolvedValue();

        await authController.register(req, res);

        expect(bcrypt.hash)
            .toHaveBeenCalledWith(

                "password123",
                10

            );

        expect(userModel.register)
            .toHaveBeenCalledWith(

                "patron",
                "alice",
                "hashedPassword",
                "alice@email.com",
                "Alice",
                "Tan"

            );

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Account created successfully."

            });

    });


    // --- Test Case 3: Successful officer registration ---
    it("should register officer successfully", async () => {

        req.body = {

            role: "officer",
            username: "officer1",
            password: "officerPassword",
            email: "officer@email.com",
            fullName: "Officer Tan",
            phone: "91234567",
            assignedArea: "West",
            profileImage: "officer.png"

        };

        userModel.login.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue(
            "hashedOfficerPassword"
        );

        userModel.register.mockResolvedValue();

        await authController.register(req, res);

        expect(userModel.register)
            .toHaveBeenCalledWith(

                "officer",
                "officer1",
                "hashedOfficerPassword",
                "officer@email.com",
                null,
                null,
                "Officer Tan",
                "91234567",
                "West",
                "officer.png"

            );

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Account created successfully."

            });

    });


    // --- Test Case 4: Registration error ---
    it("should return 500 if registration fails", async () => {

        userModel.login.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue(
            "hashedPassword"
        );

        userModel.register.mockRejectedValue(

            new Error("Database error")

        );

        await authController.register(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Internal server error."

            });

    });

});


// Refresh token controller tests
describe("AuthController.refreshToken", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            body: {

                refreshToken: "refreshToken123"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Refresh token missing ---
    it("should return 400 if refresh token is missing", async () => {

        req.body = {};

        await authController.refreshToken(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Refresh token is required."

            });

        expect(jwt.verify)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 2: Successful token refresh ---
    it("should generate a new access token", async () => {

        jwt.verify.mockReturnValue({

            id: 1,
            role: "patron"

        });

        userModel.getRefreshToken
            .mockResolvedValue(
                "refreshToken123"
            );

        jwt.sign.mockReturnValue(
            "newAccessToken"
        );

        await authController.refreshToken(req, res);

        expect(jwt.verify)
            .toHaveBeenCalledWith(

                "refreshToken123",
                process.env.REFRESH_TOKEN_SECRET

            );

        expect(userModel.getRefreshToken)
            .toHaveBeenCalledWith(

                "patron",
                1

            );

        expect(jwt.sign)
            .toHaveBeenCalledWith(

                {
                    id: 1,
                    role: "patron"
                },

                expect.any(String),

                {
                    expiresIn: "15m"
                }

            );

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                accessToken:
                    "newAccessToken"

            });

    });


    // --- Test Case 3: Stored token does not match ---
    it("should return 403 if stored token does not match", async () => {

        jwt.verify.mockReturnValue({

            id: 1,
            role: "patron"

        });

        userModel.getRefreshToken
            .mockResolvedValue(
                "differentRefreshToken"
            );

        await authController.refreshToken(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(403);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Invalid refresh token."

            });

        expect(jwt.sign)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 4: Stored token missing ---
    it("should return 403 if no stored token exists", async () => {

        jwt.verify.mockReturnValue({

            id: 1,
            role: "patron"

        });

        userModel.getRefreshToken
            .mockResolvedValue(undefined);

        await authController.refreshToken(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(403);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Invalid refresh token."

            });

    });


    // --- Test Case 5: Invalid or expired refresh token ---
    it("should return 403 if token verification fails", async () => {

        jwt.verify.mockImplementation(() => {

            throw new Error("Token expired");

        });

        await authController.refreshToken(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(403);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Invalid refresh token."

            });

    });

});


// Logout controller tests
describe("AuthController.logout", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1,
                role: "patron"

            },

            session: createMockSession()

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful logout ---
    it("should remove token and destroy session", async () => {

        userModel.removeRefreshToken
            .mockResolvedValue();

        await authController.logout(req, res);

        expect(userModel.removeRefreshToken)
            .toHaveBeenCalledWith(

                "patron",
                1

            );

        expect(req.session.destroy)
            .toHaveBeenCalledTimes(1);

        expect(res.clearCookie)
            .toHaveBeenCalledWith(
                "connect.sid"
            );

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Logged out."

            });

    });


    // --- Test Case 2: Refresh token removal fails ---
    it("should still logout if token removal fails", async () => {

        userModel.removeRefreshToken
            .mockRejectedValue(

                new Error("Database error")

            );

        await authController.logout(req, res);

        expect(req.session.destroy)
            .toHaveBeenCalledTimes(1);

        expect(res.clearCookie)
            .toHaveBeenCalledWith(
                "connect.sid"
            );

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Logged out."

            });

    });


    // --- Test Case 3: Session destruction fails ---
    it("should return 500 if session destruction fails", async () => {

        userModel.removeRefreshToken
            .mockResolvedValue();

        req.session.destroy.mockImplementation(
            callback => {

                callback(
                    new Error("Session error")
                );

            }
        );

        await authController.logout(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Internal server error."

            });

        expect(res.clearCookie)
            .not.toHaveBeenCalled();

    });

});


// Find account controller tests
describe("AuthController.findAccount", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            body: {

                role: "patron",
                username: "alice"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Account found ---
    it("should return account and verification code", async () => {

        userModel.findAccount.mockResolvedValue({

            username: "alice"

        });

        jest.spyOn(Math, "random")
            .mockReturnValue(0.5);

        await authController.findAccount(req, res);

        expect(userModel.findAccount)
            .toHaveBeenCalledWith(

                "patron",
                "alice"

            );

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Account found.",
                username: "alice",
                verificationCode: "550000"

            });

        Math.random.mockRestore();

    });


    // --- Test Case 2: Account not found ---
    it("should return 404 if account is not found", async () => {

        userModel.findAccount
            .mockResolvedValue(undefined);

        await authController.findAccount(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Account not found."

            });

    });


    // --- Test Case 3: Database error ---
    it("should return 500 if account search fails", async () => {

        userModel.findAccount.mockRejectedValue(

            new Error("Database error")

        );

        await authController.findAccount(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Internal server error."

            });

    });

});


// Verify code controller tests
describe("AuthController.verifyCode", () => {

    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        res = createMockResponse();

    });


    // --- Test Case 1: Correct verification code ---
    it("should return success if codes match", async () => {

        const req = {

            body: {

                enteredCode: "123456",
                expectedCode: "123456"

            }

        };

        await authController.verifyCode(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Verification successful."

            });

    });


    // --- Test Case 2: Incorrect verification code ---
    it("should return 400 if codes do not match", async () => {

        const req = {

            body: {

                enteredCode: "111111",
                expectedCode: "123456"

            }

        };

        await authController.verifyCode(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Incorrect verification code."

            });

    });

});


// Reset password controller tests
describe("AuthController.resetPassword", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            body: {

                role: "patron",
                username: "alice",
                newPassword: "newPassword123"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful password reset ---
    it("should hash and update password successfully", async () => {

        bcrypt.hash.mockResolvedValue(
            "newHashedPassword"
        );

        userModel.resetPassword
            .mockResolvedValue();

        await authController.resetPassword(req, res);

        expect(bcrypt.hash)
            .toHaveBeenCalledWith(

                "newPassword123",
                10

            );

        expect(userModel.resetPassword)
            .toHaveBeenCalledWith(

                "patron",
                "alice",
                "newHashedPassword"

            );

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Password reset successfully."

            });

    });


    // --- Test Case 2: Account not found ---
    it("should return 404 if account is not found", async () => {

        bcrypt.hash.mockResolvedValue(
            "newHashedPassword"
        );

        userModel.resetPassword.mockRejectedValue(

            new Error("Account not found.")

        );

        await authController.resetPassword(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Account not found."

            });

    });


    // --- Test Case 3: Unexpected password reset error ---
    it("should return 500 if password reset fails unexpectedly", async () => {

        bcrypt.hash.mockResolvedValue(
            "newHashedPassword"
        );

        userModel.resetPassword.mockRejectedValue(

            new Error("Database error")

        );

        await authController.resetPassword(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Internal server error."

            });

    });

});