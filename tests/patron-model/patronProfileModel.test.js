const sql = require("mssql");

const patronProfileModel =
    require("../../models/patronProfileModel");


jest.mock("mssql");


// Get patron profile unit tests
describe("PatronProfileModel.getPatronProfile", () => {

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

        sql.connect.mockResolvedValue(
            mockConnection
        );

    });


    // --- Test Case 1: Patron profile found ---
    it("should return the patron profile", async () => {

        const patron = {

            patron_id: 1,
            username: "alice",
            email: "alice@email.com",
            first_name: "Alice",
            last_name: "Tan"

        };

        mockRequest.query.mockResolvedValue({

            recordset: [patron]

        });

        const result =
            await patronProfileModel.getPatronProfile(1);

        expect(sql.connect)
            .toHaveBeenCalledWith(
                expect.any(Object)
            );

        expect(mockConnection.request)
            .toHaveBeenCalledTimes(1);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "FROM Patrons"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "WHERE patron_id = @patronId"
                )

            );

        expect(result).toEqual(patron);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Patron profile not found ---
    it("should return undefined if patron profile is not found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await patronProfileModel.getPatronProfile(999);

        expect(result).toBeUndefined();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Query error ---
    it("should throw an error if profile query fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            patronProfileModel.getPatronProfile(1)

        ).rejects.toThrow(
            "Database error"
        );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 4: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database connection failed")

        );

        await expect(

            patronProfileModel.getPatronProfile(1)

        ).rejects.toThrow(
            "Database connection failed"
        );

        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});


// Update patron profile unit tests
describe("PatronProfileModel.updatePatronProfile", () => {

    let mockConnection;

    let usernameRequest;
    let emailRequest;
    let updateRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        usernameRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        emailRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        updateRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn()
                .mockReturnValueOnce(usernameRequest)
                .mockReturnValueOnce(emailRequest)
                .mockReturnValueOnce(updateRequest),

            close: jest.fn()

        };

        sql.connect.mockResolvedValue(
            mockConnection
        );

    });


    // --- Test Case 1: Successful profile update ---
    it("should update the patron profile successfully", async () => {

        usernameRequest.query.mockResolvedValue({

            recordset: []

        });

        emailRequest.query.mockResolvedValue({

            recordset: []

        });

        updateRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        await patronProfileModel.updatePatronProfile(

            1,
            "alice",
            "Alice",
            "Tan",
            "alice@email.com"

        );

        expect(usernameRequest.input)
            .toHaveBeenCalledWith(

                "username",
                sql.VarChar,
                "alice"

            );

        expect(usernameRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );

        expect(usernameRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "WHERE username = @username"
                )

            );

        expect(usernameRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "AND patron_id <> @patronId"
                )

            );

        expect(emailRequest.input)
            .toHaveBeenCalledWith(

                "email",
                sql.VarChar,
                "alice@email.com"

            );

        expect(emailRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );

        expect(emailRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "WHERE email = @email"
                )

            );

        expect(updateRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );

        expect(updateRequest.input)
            .toHaveBeenCalledWith(

                "username",
                sql.VarChar,
                "alice"

            );

        expect(updateRequest.input)
            .toHaveBeenCalledWith(

                "firstName",
                sql.VarChar,
                "Alice"

            );

        expect(updateRequest.input)
            .toHaveBeenCalledWith(

                "lastName",
                sql.VarChar,
                "Tan"

            );

        expect(updateRequest.input)
            .toHaveBeenCalledWith(

                "email",
                sql.VarChar,
                "alice@email.com"

            );

        expect(updateRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "UPDATE Patrons"
                )

            );

        expect(updateRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "updated_at = GETDATE()"
                )

            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Username already exists ---
    it("should throw an error if username already exists", async () => {

        usernameRequest.query.mockResolvedValue({

            recordset: [

                {
                    patron_id: 2
                }

            ]

        });

        await expect(

            patronProfileModel.updatePatronProfile(

                1,
                "alice",
                "Alice",
                "Tan",
                "alice@email.com"

            )

        ).rejects.toThrow(
            "Username already exists."
        );

        expect(emailRequest.query)
            .not.toHaveBeenCalled();

        expect(updateRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Email already exists ---
    it("should throw an error if email already exists", async () => {

        usernameRequest.query.mockResolvedValue({

            recordset: []

        });

        emailRequest.query.mockResolvedValue({

            recordset: [

                {
                    patron_id: 2
                }

            ]

        });

        await expect(

            patronProfileModel.updatePatronProfile(

                1,
                "alice",
                "Alice",
                "Tan",
                "alice@email.com"

            )

        ).rejects.toThrow(
            "Email already exists."
        );

        expect(updateRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 4: Username check query error ---
    it("should throw an error if username check fails", async () => {

        usernameRequest.query.mockRejectedValue(

            new Error("Username query failed")

        );

        await expect(

            patronProfileModel.updatePatronProfile(

                1,
                "alice",
                "Alice",
                "Tan",
                "alice@email.com"

            )

        ).rejects.toThrow(
            "Username query failed"
        );

        expect(emailRequest.query)
            .not.toHaveBeenCalled();

        expect(updateRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 5: Email check query error ---
    it("should throw an error if email check fails", async () => {

        usernameRequest.query.mockResolvedValue({

            recordset: []

        });

        emailRequest.query.mockRejectedValue(

            new Error("Email query failed")

        );

        await expect(

            patronProfileModel.updatePatronProfile(

                1,
                "alice",
                "Alice",
                "Tan",
                "alice@email.com"

            )

        ).rejects.toThrow(
            "Email query failed"
        );

        expect(updateRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 6: Update query error ---
    it("should throw an error if profile update fails", async () => {

        usernameRequest.query.mockResolvedValue({

            recordset: []

        });

        emailRequest.query.mockResolvedValue({

            recordset: []

        });

        updateRequest.query.mockRejectedValue(

            new Error("Update failed")

        );

        await expect(

            patronProfileModel.updatePatronProfile(

                1,
                "alice",
                "Alice",
                "Tan",
                "alice@email.com"

            )

        ).rejects.toThrow(
            "Update failed"
        );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 7: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database connection failed")

        );

        await expect(

            patronProfileModel.updatePatronProfile(

                1,
                "alice",
                "Alice",
                "Tan",
                "alice@email.com"

            )

        ).rejects.toThrow(
            "Database connection failed"
        );

        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});


// Delete patron account unit tests
describe("PatronProfileModel.deletePatronAccount", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(
            mockConnection
        );

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful account deletion ---
    it("should delete the patron and all related records", async () => {

        mockRequest.query.mockResolvedValue({});

        await patronProfileModel.deletePatronAccount(1);

        expect(sql.connect)
            .toHaveBeenCalledWith(
                expect.any(Object)
            );

        expect(mockConnection.request)
            .toHaveBeenCalledTimes(1);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM FavouriteOrderHistory"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM Feedbacks"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM Complaints"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM OrderHistory"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM OrderItems"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "FROM Orders"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM Orders"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM CartItems"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "FROM Carts"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM Carts"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM Cards"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM Patrons"
                )

            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Order items are deleted before orders ---
    it("should delete order items before deleting orders", async () => {

        mockRequest.query.mockResolvedValue({});

        await patronProfileModel.deletePatronAccount(1);

        const query =
            mockRequest.query.mock.calls[0][0];

        const orderItemsPosition =
            query.indexOf(
                "DELETE FROM OrderItems"
            );

        const ordersPosition =
            query.indexOf(
                "DELETE FROM Orders"
            );

        expect(orderItemsPosition)
            .toBeGreaterThan(-1);

        expect(ordersPosition)
            .toBeGreaterThan(-1);

        expect(orderItemsPosition)
            .toBeLessThan(ordersPosition);

    });


    // --- Test Case 3: Cart items are deleted before carts ---
    it("should delete cart items before deleting the cart", async () => {

        mockRequest.query.mockResolvedValue({});

        await patronProfileModel.deletePatronAccount(1);

        const query =
            mockRequest.query.mock.calls[0][0];

        const cartItemsPosition =
            query.indexOf(
                "DELETE FROM CartItems"
            );

        const cartsPosition =
            query.indexOf(
                "DELETE FROM Carts"
            );

        expect(cartItemsPosition)
            .toBeGreaterThan(-1);

        expect(cartsPosition)
            .toBeGreaterThan(-1);

        expect(cartItemsPosition)
            .toBeLessThan(cartsPosition);

    });


    // --- Test Case 4: Patron is deleted last ---
    it("should delete the patron after related records", async () => {

        mockRequest.query.mockResolvedValue({});

        await patronProfileModel.deletePatronAccount(1);

        const query =
            mockRequest.query.mock.calls[0][0];

        const cardsPosition =
            query.indexOf(
                "DELETE FROM Cards"
            );

        const patronPosition =
            query.indexOf(
                "DELETE FROM Patrons"
            );

        expect(cardsPosition)
            .toBeGreaterThan(-1);

        expect(patronPosition)
            .toBeGreaterThan(-1);

        expect(cardsPosition)
            .toBeLessThan(patronPosition);

    });


    // --- Test Case 5: Delete query error ---
    it("should throw an error if account deletion fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Delete failed")

        );

        await expect(

            patronProfileModel.deletePatronAccount(1)

        ).rejects.toThrow(
            "Delete failed"
        );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 6: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database connection failed")

        );

        await expect(

            patronProfileModel.deletePatronAccount(1)

        ).rejects.toThrow(
            "Database connection failed"
        );

        expect(mockConnection.request)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});