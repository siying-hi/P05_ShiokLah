const sql = require("mssql");
const userModel = require("../../models/userModel");

jest.mock("mssql");


// Login unit tests
describe("UserModel.login", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(mockConnection);

    });


    // --- Test Case 1: Successful patron login ---
    it("should return user record for patron", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    id: 1,
                    username: "alice",
                    password: "hashedPassword"
                }

            ]

        });

        const result =
            await userModel.login(
                "patron",
                "alice"
            );

        expect(sql.connect)
            .toHaveBeenCalledWith(expect.any(Object));

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "username",
                sql.VarChar,
                "alice"
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM Patrons")
            );

        expect(result).toEqual({

            id: 1,
            username: "alice",
            password: "hashedPassword"

        });

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Successful vendor login ---
    it("should return user record for vendor", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    id: 2,
                    username: "vendor1",
                    password: "hashedPassword"
                }

            ]

        });

        const result =
            await userModel.login(
                "vendor",
                "vendor1"
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM Vendors")
            );

        expect(result).toEqual({

            id: 2,
            username: "vendor1",
            password: "hashedPassword"

        });

    });


    // --- Test Case 3: Successful operator login ---
    it("should return user record for operator", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    id: 3,
                    username: "operator1",
                    password: "hashedPassword"
                }

            ]

        });

        const result =
            await userModel.login(
                "operator",
                "operator1"
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM Operators")
            );

        expect(result).toEqual({

            id: 3,
            username: "operator1",
            password: "hashedPassword"

        });

    });


    // --- Test Case 4: Successful officer login ---
    it("should return user record for officer", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    id: 4,
                    username: "officer1",
                    password: "hashedPassword"
                }

            ]

        });

        const result =
            await userModel.login(
                "officer",
                "officer1"
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM NEAOfficers")
            );

        expect(result).toEqual({

            id: 4,
            username: "officer1",
            password: "hashedPassword"

        });

    });


    // --- Test Case 5: Account not found ---
    it("should return null if account is not found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await userModel.login(
                "patron",
                "unknown"
            );

        expect(result).toBeNull();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 6: Invalid role ---
    it("should return null if role is invalid", async () => {

        const result =
            await userModel.login(
                "invalid",
                "alice"
            );

        expect(result).toBeNull();

        expect(mockRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 7: Query error ---
    it("should throw an error if database query fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Query failed")

        );

        await expect(

            userModel.login(
                "patron",
                "alice"
            )

        ).rejects.toThrow("Query failed");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 8: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            userModel.login(
                "patron",
                "alice"
            )

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});


// Register unit tests
describe("UserModel.register", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(mockConnection);

    });


    // --- Test Case 1: Successful patron registration ---
    it("should insert patron record successfully", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.register(

            "patron",
            "alice",
            "hashedPassword",
            "alice@email.com",
            "Alice",
            "Tan"

        );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "username",
                sql.VarChar,
                "alice"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "password",
                sql.VarChar,
                "hashedPassword"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "email",
                sql.VarChar,
                "alice@email.com"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "firstName",
                sql.VarChar,
                "Alice"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "lastName",
                sql.VarChar,
                "Tan"
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO Patrons")
            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Successful vendor registration ---
    it("should insert vendor record successfully", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.register(

            "vendor",
            "vendor1",
            "hashedPassword",
            "vendor@email.com",
            "John",
            "Lim"

        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO Vendors")
            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Successful operator registration ---
    it("should insert operator record successfully", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.register(

            "operator",
            "operator1",
            "hashedPassword",
            "operator@email.com",
            "Mary",
            "Lee"

        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO Operators")
            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 4: Successful officer registration ---
    it("should insert officer record successfully", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.register(

            "officer",
            "officer1",
            "hashedPassword",
            "officer@email.com",
            undefined,
            undefined,
            "Officer Tan",
            "91234567",
            "West",
            "officer.png"

        );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "full_name",
                sql.VarChar,
                "Officer Tan"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "phone",
                sql.VarChar,
                "91234567"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "assigned_area",
                sql.VarChar,
                "West"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "profile_image",
                sql.VarChar,
                "officer.png"
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO NEAOfficers")
            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 5: Officer default values ---
    it("should use default values for optional officer fields", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.register(

            "officer",
            "officer1",
            "hashedPassword",
            "officer@email.com",
            undefined,
            undefined,
            "Officer Tan"

        );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "phone",
                sql.VarChar,
                null
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "assigned_area",
                sql.VarChar,
                null
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "profile_image",
                sql.VarChar,
                "default-officer.png"
            );

    });


    // --- Test Case 6: Invalid role ---
    it("should throw an error for invalid role", async () => {

        await expect(

            userModel.register(
                "invalid",
                "alice",
                "password"
            )

        ).rejects.toThrow("Invalid role.");

        expect(mockRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 7: Query error ---
    it("should throw an error if registration query fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Query failed")

        );

        await expect(

            userModel.register(

                "patron",
                "alice",
                "hashedPassword",
                "alice@email.com",
                "Alice",
                "Tan"

            )

        ).rejects.toThrow("Query failed");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 8: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            userModel.register(
                "patron",
                "alice",
                "hashedPassword"
            )

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});


// Save refresh token unit tests
describe("UserModel.saveRefreshToken", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(mockConnection);

    });


    // --- Test Case 1: Successful token save ---
    it("should save patron refresh token successfully", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.saveRefreshToken(

            "patron",
            1,
            "token123"

        );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "refreshToken",
                sql.VarChar,
                "token123"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "id",
                sql.Int,
                1
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE Patrons")
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "SET refresh_token = @refreshToken"
                )
            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Vendor table selection ---
    it("should save refresh token in Vendors table", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.saveRefreshToken(

            "vendor",
            2,
            "vendorToken"

        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE Vendors")
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("vendor_id = @id")
            );

    });


    // --- Test Case 3: Operator table selection ---
    it("should save refresh token in Operators table", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.saveRefreshToken(

            "operator",
            3,
            "operatorToken"

        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE Operators")
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("operator_id = @id")
            );

    });


    // --- Test Case 4: Officer table selection ---
    it("should save refresh token in NEAOfficers table", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.saveRefreshToken(

            "officer",
            4,
            "officerToken"

        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE NEAOfficers")
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("officer_id = @id")
            );

    });


    // --- Test Case 5: Query error ---
    it("should throw an error if token update fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Query failed")

        );

        await expect(

            userModel.saveRefreshToken(
                "patron",
                1,
                "token123"
            )

        ).rejects.toThrow("Query failed");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 6: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            userModel.saveRefreshToken(
                "patron",
                1,
                "token123"
            )

        ).rejects.toThrow("Database error");

    });

});


// Get refresh token unit tests
describe("UserModel.getRefreshToken", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(mockConnection);

    });


    // --- Test Case 1: Successful token retrieval ---
    it("should return stored refresh token", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    refresh_token: "token123"
                }

            ]

        });

        const result =
            await userModel.getRefreshToken(
                "patron",
                1
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "id",
                sql.Int,
                1
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM Patrons")
            );

        expect(result).toBe("token123");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Token not found ---
    it("should return undefined if refresh token is not found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await userModel.getRefreshToken(
                "patron",
                1
            );

        expect(result).toBeUndefined();

    });


    // --- Test Case 3: Vendor table selection ---
    it("should retrieve refresh token from Vendors table", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    refresh_token: "vendorToken"
                }

            ]

        });

        const result =
            await userModel.getRefreshToken(
                "vendor",
                2
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM Vendors")
            );

        expect(result).toBe("vendorToken");

    });


    // --- Test Case 4: Query error ---
    it("should throw an error if token query fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Query failed")

        );

        await expect(

            userModel.getRefreshToken(
                "patron",
                1
            )

        ).rejects.toThrow("Query failed");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 5: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            userModel.getRefreshToken(
                "patron",
                1
            )

        ).rejects.toThrow("Database error");

    });

});


// Remove refresh token unit tests
describe("UserModel.removeRefreshToken", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(mockConnection);

    });


    // --- Test Case 1: Successful token removal ---
    it("should set patron refresh token to NULL", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.removeRefreshToken(
            "patron",
            1
        );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "id",
                sql.Int,
                1
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE Patrons")
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "SET refresh_token = NULL"
                )
            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Officer table selection ---
    it("should remove refresh token from NEAOfficers table", async () => {

        mockRequest.query.mockResolvedValue({});

        await userModel.removeRefreshToken(
            "officer",
            4
        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE NEAOfficers")
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("officer_id = @id")
            );

    });


    // --- Test Case 3: Query error ---
    it("should throw an error if token removal fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Query failed")

        );

        await expect(

            userModel.removeRefreshToken(
                "patron",
                1
            )

        ).rejects.toThrow("Query failed");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 4: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            userModel.removeRefreshToken(
                "patron",
                1
            )

        ).rejects.toThrow("Database error");

    });

});


// Find account unit tests
describe("UserModel.findAccount", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(mockConnection);

    });


    // --- Test Case 1: Patron account found ---
    it("should return patron account if found", async () => {

        const account = {

            patron_id: 1,
            username: "alice",
            email: "alice@email.com"

        };

        mockRequest.query.mockResolvedValue({

            recordset: [account]

        });

        const result =
            await userModel.findAccount(
                "patron",
                "alice"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "username",
                sql.VarChar,
                "alice"
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM Patrons")
            );

        expect(result).toEqual(account);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Vendor account found ---
    it("should retrieve account from Vendors table", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    vendor_id: 2,
                    username: "vendor1"
                }

            ]

        });

        await userModel.findAccount(
            "vendor",
            "vendor1"
        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM Vendors")
            );

    });


    // --- Test Case 3: Operator account found ---
    it("should retrieve account from Operators table", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    operator_id: 3,
                    username: "operator1"
                }

            ]

        });

        await userModel.findAccount(
            "operator",
            "operator1"
        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM Operators")
            );

    });


    // --- Test Case 4: Officer account found ---
    it("should retrieve account from NEAOfficers table", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    officer_id: 4,
                    username: "officer1"
                }

            ]

        });

        await userModel.findAccount(
            "officer",
            "officer1"
        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM NEAOfficers")
            );

    });


    // --- Test Case 5: Account not found ---
    it("should return undefined if account is not found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await userModel.findAccount(
                "patron",
                "unknown"
            );

        expect(result).toBeUndefined();

    });


    // --- Test Case 6: Invalid role ---
    it("should throw an error for invalid role", async () => {

        await expect(

            userModel.findAccount(
                "invalid",
                "alice"
            )

        ).rejects.toThrow("Invalid role.");

        expect(mockRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 7: Query error ---
    it("should throw an error if account query fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Query failed")

        );

        await expect(

            userModel.findAccount(
                "patron",
                "alice"
            )

        ).rejects.toThrow("Query failed");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 8: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            userModel.findAccount(
                "patron",
                "alice"
            )

        ).rejects.toThrow("Database error");

    });

});


// Reset password unit tests
describe("UserModel.resetPassword", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(mockConnection);

    });


    // --- Test Case 1: Successful patron password reset ---
    it("should update patron password successfully", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        await userModel.resetPassword(

            "patron",
            "alice",
            "newHashedPassword"

        );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "username",
                sql.VarChar,
                "alice"
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "password",
                sql.VarChar,
                "newHashedPassword"
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE Patrons")
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "updated_at = GETDATE()"
                )
            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Vendor table selection ---
    it("should update password in Vendors table", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        await userModel.resetPassword(

            "vendor",
            "vendor1",
            "newPassword"
        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE Vendors")
            );

    });


    // --- Test Case 3: Operator table selection ---
    it("should update password in Operators table", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        await userModel.resetPassword(

            "operator",
            "operator1",
            "newPassword"
        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE Operators")
            );

    });


    // --- Test Case 4: Officer table selection ---
    it("should update password in NEAOfficers table", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        await userModel.resetPassword(

            "officer",
            "officer1",
            "newPassword"
        );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("UPDATE NEAOfficers")
            );

    });


    // --- Test Case 5: Account not found ---
    it("should throw an error if account is not found", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [0]

        });

        await expect(

            userModel.resetPassword(

                "patron",
                "unknown",
                "newPassword"

            )

        ).rejects.toThrow("Account not found.");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 6: Invalid role ---
    it("should throw an error for invalid role", async () => {

        await expect(

            userModel.resetPassword(

                "invalid",
                "alice",
                "newPassword"

            )

        ).rejects.toThrow("Invalid role.");

        expect(mockRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 7: Query error ---
    it("should throw an error if password update fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Query failed")

        );

        await expect(

            userModel.resetPassword(

                "patron",
                "alice",
                "newPassword"

            )

        ).rejects.toThrow("Query failed");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 8: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            userModel.resetPassword(

                "patron",
                "alice",
                "newPassword"

            )

        ).rejects.toThrow("Database error");

    });

});