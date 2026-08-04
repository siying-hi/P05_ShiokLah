jest.mock("mssql");

jest.mock("../../utils/encryption", () => ({

    encrypt: jest.fn(),
    decrypt: jest.fn()

}));


const sql =
    require("mssql");

const {
    encrypt,
    decrypt
} = require("../../utils/encryption");

const cardModel =
    require("../../models/cardModel");


// Add card unit tests
describe("CardModel.addCard", () => {

    let mockConnection;
    let duplicateCheckRequest;
    let insertRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        duplicateCheckRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        insertRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn()
                .mockReturnValueOnce(duplicateCheckRequest)
                .mockReturnValueOnce(insertRequest),

            close: jest.fn()

        };

        sql.connect.mockResolvedValue(
            mockConnection
        );

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful card addition ---
    it("should encrypt and add a new card successfully", async () => {

        duplicateCheckRequest.query.mockResolvedValue({

            recordset: []

        });

        encrypt
            .mockReturnValueOnce("encryptedCardNumber")
            .mockReturnValueOnce("encryptedCVV");

        insertRequest.query.mockResolvedValue({});

        await cardModel.addCard(

            1,
            "Alice Tan",
            "4111111111111111",
            "12",
            "2030",
            "123"

        );

        expect(duplicateCheckRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );

        expect(duplicateCheckRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "SELECT"
                )

            );

        expect(duplicateCheckRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "FROM Cards"
                )

            );

        expect(encrypt)
            .toHaveBeenNthCalledWith(

                1,
                "4111111111111111"

            );

        expect(encrypt)
            .toHaveBeenNthCalledWith(

                2,
                "123"

            );

        expect(insertRequest.input)
            .toHaveBeenCalledWith(

                "cardNumber",
                sql.VarChar(255),
                "encryptedCardNumber"

            );

        expect(insertRequest.input)
            .toHaveBeenCalledWith(

                "cvv",
                sql.VarChar(255),
                "encryptedCVV"

            );

        expect(insertRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "INSERT INTO Cards"
                )

            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Duplicate card ---
    it("should throw an error if the same card already exists", async () => {

        duplicateCheckRequest.query.mockResolvedValue({

            recordset: [

                {
                    card_number: "storedEncryptedCard"
                }

            ]

        });

        decrypt.mockReturnValue(
            "4111111111111111"
        );

        await expect(

            cardModel.addCard(

                1,
                "Alice Tan",
                "4111111111111111",
                "12",
                "2030",
                "123"

            )

        ).rejects.toThrow(
            "Card already exists."
        );

        expect(decrypt)
            .toHaveBeenCalledWith(
                "storedEncryptedCard"
            );

        expect(encrypt)
            .not.toHaveBeenCalled();

        expect(insertRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Existing different card ---
    it("should add the card if existing cards have different numbers", async () => {

        duplicateCheckRequest.query.mockResolvedValue({

            recordset: [

                {
                    card_number: "storedEncryptedCard"
                }

            ]

        });

        decrypt.mockReturnValue(
            "5555555555554444"
        );

        encrypt
            .mockReturnValueOnce("encryptedCardNumber")
            .mockReturnValueOnce("encryptedCVV");

        insertRequest.query.mockResolvedValue({});

        await cardModel.addCard(

            1,
            "Alice Tan",
            "4111111111111111",
            "12",
            "2030",
            "123"

        );

        expect(insertRequest.query)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 4: Duplicate-check query error ---
    it("should throw an error if duplicate checking fails", async () => {

        duplicateCheckRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cardModel.addCard(

                1,
                "Alice Tan",
                "4111111111111111",
                "12",
                "2030",
                "123"

            )

        ).rejects.toThrow(
            "Database error"
        );

        expect(insertRequest.query)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 5: Insert error ---
    it("should throw an error if inserting the card fails", async () => {

        duplicateCheckRequest.query.mockResolvedValue({

            recordset: []

        });

        encrypt
            .mockReturnValueOnce("encryptedCardNumber")
            .mockReturnValueOnce("encryptedCVV");

        insertRequest.query.mockRejectedValue(

            new Error("Insert failed")

        );

        await expect(

            cardModel.addCard(

                1,
                "Alice Tan",
                "4111111111111111",
                "12",
                "2030",
                "123"

            )

        ).rejects.toThrow(
            "Insert failed"
        );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Get patron cards unit tests
describe("CardModel.getCardsByPatronId", () => {

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


    // --- Test Case 1: Successful retrieval ---
    it("should return decrypted and masked patron cards", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    card_id: 1,
                    cardholder_name: "Alice Tan",
                    card_number: "encryptedNumber1",
                    expiry_month: "12",
                    expiry_year: "2028",
                    is_default: true
                },

                {
                    card_id: 2,
                    cardholder_name: "Alice Tan",
                    card_number: "encryptedNumber2",
                    expiry_month: "06",
                    expiry_year: "2029",
                    is_default: false
                }

            ]

        });

        decrypt
            .mockReturnValueOnce("4111111111111111")
            .mockReturnValueOnce("5555555555554444");

        const result =
            await cardModel.getCardsByPatronId(1);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "patronId",
                sql.Int,
                1
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "WHERE patron_id = @patronId"
                )
            );

        expect(decrypt)
            .toHaveBeenNthCalledWith(
                1,
                "encryptedNumber1"
            );

        expect(decrypt)
            .toHaveBeenNthCalledWith(
                2,
                "encryptedNumber2"
            );

        expect(result).toEqual([

            {
                cardId: 1,
                cardholderName: "Alice Tan",
                cardNumber: "•••• •••• •••• 1111",
                expiry: "12/2028",
                isDefault: true
            },

            {
                cardId: 2,
                cardholderName: "Alice Tan",
                cardNumber: "•••• •••• •••• 4444",
                expiry: "06/2029",
                isDefault: false
            }

        ]);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: No cards ---
    it("should return an empty array if patron has no cards", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await cardModel.getCardsByPatronId(1);

        expect(result).toEqual([]);

        expect(decrypt)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if loading cards fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cardModel.getCardsByPatronId(1)

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Get card by ID unit tests
describe("CardModel.getCardById", () => {

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


    // --- Test Case 1: Card found ---
    it("should return decrypted and masked card details", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    card_id: 5,
                    cardholder_name: "Alice Tan",
                    card_number: "encryptedCardNumber",
                    expiry_month: "12",
                    expiry_year: "2028",
                    cvv: "encryptedCVV",
                    is_default: true
                }

            ]

        });

        decrypt.mockReturnValue(
            "4111111111111111"
        );

        const result =
            await cardModel.getCardById(
                1,
                5
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "patronId",
                sql.Int,
                1
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "cardId",
                sql.Int,
                5
            );

        expect(decrypt)
            .toHaveBeenCalledWith(
                "encryptedCardNumber"
            );

        expect(result).toEqual({

            cardId: 5,
            cardholderName: "Alice Tan",
            cardNumber: "**** **** **** 1111",
            expiryMonth: "12",
            expiryYear: "2028",
            expiry: "12/2028",
            cvv: "***",
            isDefault: true

        });

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Card not found ---
    it("should return null if card is not found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await cardModel.getCardById(
                1,
                999
            );

        expect(result).toBeNull();

        expect(decrypt)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if loading card fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cardModel.getCardById(
                1,
                5
            )

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Update card unit tests
describe("CardModel.updateCard", () => {

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


    // --- Test Case 1: Update basic card details only ---
    it("should update name and expiry without changing card number or CVV", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        await cardModel.updateCard(

            1,
            5,
            "Alice Tan",
            "",
            "10",
            "2031",
            ""

        );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "cardId",
                sql.Int,
                5

            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "cardholderName",
                sql.VarChar(100),
                "Alice Tan"

            );

        expect(encrypt)
            .not.toHaveBeenCalled();

        expect(mockRequest.input)
            .not.toHaveBeenCalledWith(

                "cardNumber",
                expect.anything(),
                expect.anything()

            );

        expect(mockRequest.input)
            .not.toHaveBeenCalledWith(

                "cvv",
                expect.anything(),
                expect.anything()

            );

        const query =
            mockRequest.query.mock.calls[0][0];

        expect(query)
            .not.toContain(
                "card_number = @cardNumber"
            );

        expect(query)
            .not.toContain(
                "cvv = @cvv"
            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Update card number and CVV ---
    it("should encrypt and update a new card number and CVV", async () => {

        encrypt
            .mockReturnValueOnce("newEncryptedCard")
            .mockReturnValueOnce("newEncryptedCVV");

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        await cardModel.updateCard(

            1,
            5,
            "Alice Tan",
            "5555555555554444",
            "10",
            "2031",
            "456"

        );

        expect(encrypt)
            .toHaveBeenNthCalledWith(

                1,
                "5555555555554444"

            );

        expect(encrypt)
            .toHaveBeenNthCalledWith(

                2,
                "456"

            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "cardNumber",
                sql.VarChar(255),
                "newEncryptedCard"

            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "cvv",
                sql.VarChar(255),
                "newEncryptedCVV"

            );

        const query =
            mockRequest.query.mock.calls[0][0];

        expect(query)
            .toContain(
                "card_number = @cardNumber"
            );

        expect(query)
            .toContain(
                "cvv = @cvv"
            );

    });


    // --- Test Case 3: Card not found ---
    it("should throw an error if no card is updated", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [0]

        });

        await expect(

            cardModel.updateCard(

                1,
                999,
                "Alice Tan",
                "",
                "10",
                "2031",
                ""

            )

        ).rejects.toThrow(
            "Card not found."
        );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 4: Database error ---
    it("should throw an error if updating the card fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cardModel.updateCard(

                1,
                5,
                "Alice Tan",
                "",
                "10",
                "2031",
                ""

            )

        ).rejects.toThrow(
            "Database error"
        );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Set default card unit tests
describe("CardModel.setDefaultCard", () => {

    let mockConnection;
    let mockTransaction;
    let removeDefaultRequest;
    let setDefaultRequest;

    beforeEach(() => {

        jest.resetAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        mockConnection = {

            close: jest.fn()

        };

        mockTransaction = {

            begin: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn()

        };

        removeDefaultRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        setDefaultRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        sql.connect.mockResolvedValue(
            mockConnection
        );

        sql.Transaction.mockImplementation(
            () => mockTransaction
        );

        sql.Request
            .mockImplementationOnce(
                () => removeDefaultRequest
            )
            .mockImplementationOnce(
                () => setDefaultRequest
            );

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Set default successfully ---
    it("should remove the old default and set the selected card as default", async () => {

        removeDefaultRequest.query
            .mockResolvedValue({

                rowsAffected: [1]

            });

        setDefaultRequest.query
            .mockResolvedValue({

                rowsAffected: [1]

            });

        await cardModel.setDefaultCard(
            1,
            5
        );

        expect(mockTransaction.begin)
            .toHaveBeenCalledTimes(1);

        expect(removeDefaultRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );

        expect(removeDefaultRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "SET is_default = 0"
                )

            );

        expect(setDefaultRequest.input)
            .toHaveBeenCalledWith(

                "cardId",
                sql.Int,
                5

            );

        expect(setDefaultRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "SET"
                )

            );

        expect(setDefaultRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "is_default = 1"
                )

            );

        expect(mockTransaction.commit)
            .toHaveBeenCalledTimes(1);

        expect(mockTransaction.rollback)
            .not.toHaveBeenCalled();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Card not found ---
    it("should rollback and throw an error if card is not found", async () => {

        removeDefaultRequest.query
            .mockResolvedValue({

                rowsAffected: [1]

            });

        setDefaultRequest.query
            .mockResolvedValue({

                rowsAffected: [0]

            });

        await expect(

            cardModel.setDefaultCard(
                1,
                999
            )

        ).rejects.toThrow(
            "Card not found."
        );

        expect(mockTransaction.commit)
            .not.toHaveBeenCalled();

        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Removing previous default fails ---
    it("should rollback if removing the previous default fails", async () => {

        removeDefaultRequest.query
            .mockRejectedValue(

                new Error("Remove default failed")

            );

        await expect(

            cardModel.setDefaultCard(
                1,
                5
            )

        ).rejects.toThrow(
            "Remove default failed"
        );

        expect(setDefaultRequest.query)
            .not.toHaveBeenCalled();

        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);

        expect(mockTransaction.commit)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 4: Setting new default fails ---
    it("should rollback if setting the new default fails", async () => {

        removeDefaultRequest.query
            .mockResolvedValue({

                rowsAffected: [1]

            });

        setDefaultRequest.query
            .mockRejectedValue(

                new Error("Set default failed")

            );

        await expect(

            cardModel.setDefaultCard(
                1,
                5
            )

        ).rejects.toThrow(
            "Set default failed"
        );

        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);

        expect(mockTransaction.commit)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 5: Rollback failure ---
    it("should still throw the original error if rollback fails", async () => {

        removeDefaultRequest.query
            .mockRejectedValue(

                new Error("Original error")

            );

        mockTransaction.rollback
            .mockRejectedValue(

                new Error("Rollback failed")

            );

        await expect(

            cardModel.setDefaultCard(
                1,
                5
            )

        ).rejects.toThrow(
            "Original error"
        );

        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Delete card unit tests
describe("CardModel.deleteCard", () => {

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


    // --- Test Case 1: Successful card deletion ---
    it("should return true if card is deleted", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        const result =
            await cardModel.deleteCard(
                1,
                5
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "patronId",
                sql.Int,
                1
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "cardId",
                sql.Int,
                5
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "DELETE FROM Cards"
                )
            );

        expect(result).toBe(true);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Card not found ---
    it("should return false if no card is deleted", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [0]

        });

        const result =
            await cardModel.deleteCard(
                1,
                999
            );

        expect(result).toBe(false);

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if card deletion fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cardModel.deleteCard(
                1,
                5
            )

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Get default card unit tests
describe("CardModel.getDefaultCard", () => {

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


    // --- Test Case 1: Default card found ---
    it("should return decrypted and masked default card", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    card_id: 5,
                    card_number: "encryptedCardNumber",
                    expiry_month: "12",
                    expiry_year: "2028"
                }

            ]

        });

        decrypt.mockReturnValue(
            "4111111111111111"
        );

        const result =
            await cardModel.getDefaultCard(1);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "patronId",
                sql.Int,
                1
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "AND is_default = 1"
                )
            );

        expect(decrypt)
            .toHaveBeenCalledWith(
                "encryptedCardNumber"
            );

        expect(result).toEqual({

            cardId: 5,
            cardNumber: "•••• •••• •••• 1111",
            expiry: "12/2028"

        });

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: No default card ---
    it("should return null if no default card exists", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await cardModel.getDefaultCard(1);

        expect(result).toBeNull();

        expect(decrypt)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if loading default card fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cardModel.getDefaultCard(1)

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});