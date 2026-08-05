jest.mock("../../models/cardModel", () => ({

    addCard: jest.fn(),
    getCardsByPatronId: jest.fn(),
    getCardById: jest.fn(),
    updateCard: jest.fn(),
    setDefaultCard: jest.fn(),
    deleteCard: jest.fn(),
    getDefaultCard: jest.fn()

}));


const cardModel =
    require("../../models/cardModel");

const cardController =
    require("../../controllers/cardController");


// Create mock response object
function createMockResponse() {

    const res = {

        status: jest.fn(),
        json: jest.fn()

    };

    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);

    return res;

}


// Add card tests
describe("CardController.addCard", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1

            },

            body: {

                cardholderName: "Alice Tan",
                cardNumber: "4111111111111111",
                expiryMonth: "12",
                expiryYear: "2030",
                cvv: "123"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful card addition ---
    it("should add a Visa card successfully", async () => {

        cardModel.addCard
            .mockResolvedValue();

        await cardController.addCard(req, res);

        expect(cardModel.addCard)
            .toHaveBeenCalledWith(

                1,
                "Alice Tan",
                "4111111111111111",
                "12",
                "2030",
                "123"

            );

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Visa card added successfully."

            });

    });


    // --- Test Case 2: Duplicate card ---
    it("should return 409 if the card already exists", async () => {

        cardModel.addCard.mockRejectedValue(

            new Error("Card already exists.")

        );

        await cardController.addCard(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(409);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "This card has already been added."

            });

    });


    // --- Test Case 3: Unexpected model error ---
    it("should return 500 if adding the card fails", async () => {

        cardModel.addCard.mockRejectedValue(

            new Error("Database error")

        );

        await cardController.addCard(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Unable to add card."

            });

    });

});


// Get cards by patron tests
describe("CardController.getCardsByPatronId", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Cards retrieved successfully ---
    it("should return all cards belonging to the patron", async () => {

        const cards = [

            {
                card_id: 1,
                cardholder_name: "Alice Tan",
                masked_card_number: "**** **** **** 1111",
                expiry_month: "12",
                expiry_year: "2030",
                is_default: true
            },

            {
                card_id: 2,
                cardholder_name: "Alice Tan",
                masked_card_number: "**** **** **** 4444",
                expiry_month: "10",
                expiry_year: "2031",
                is_default: false
            }

        ];

        cardModel.getCardsByPatronId
            .mockResolvedValue(cards);

        await cardController.getCardsByPatronId(
            req,
            res
        );

        expect(cardModel.getCardsByPatronId)
            .toHaveBeenCalledWith(1);

        expect(res.json)
            .toHaveBeenCalledWith(cards);

    });


    // --- Test Case 2: Patron has no cards ---
    it("should return an empty array if the patron has no cards", async () => {

        cardModel.getCardsByPatronId
            .mockResolvedValue([]);

        await cardController.getCardsByPatronId(
            req,
            res
        );

        expect(res.json)
            .toHaveBeenCalledWith([]);

    });


    // --- Test Case 3: Model error ---
    it("should return 500 if loading cards fails", async () => {

        cardModel.getCardsByPatronId
            .mockRejectedValue(

                new Error("Database error")

            );

        await cardController.getCardsByPatronId(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Unable to load cards."

            });

    });

});


// Get card by ID tests
describe("CardController.getCardById", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1

            },

            params: {

                cardId: "5"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Card found ---
    it("should return the selected card", async () => {

        const card = {

            card_id: 5,
            cardholder_name: "Alice Tan",
            masked_card_number: "**** **** **** 1111",
            expiry_month: "12",
            expiry_year: "2030"

        };

        cardModel.getCardById
            .mockResolvedValue(card);

        await cardController.getCardById(
            req,
            res
        );

        expect(cardModel.getCardById)
            .toHaveBeenCalledWith(

                1,
                "5"

            );

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith(card);

    });


    // --- Test Case 2: Card not found ---
    it("should return 404 if the card is not found", async () => {

        cardModel.getCardById
            .mockResolvedValue(undefined);

        await cardController.getCardById(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Card not found."

            });

    });


    // --- Test Case 3: Model error ---
    it("should return 500 if loading the card fails", async () => {

        cardModel.getCardById
            .mockRejectedValue(

                new Error("Database error")

            );

        await cardController.getCardById(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Unable to load card."

            });

    });

});


// Update card tests
describe("CardController.updateCard", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1

            },

            params: {

                cardId: "5"

            },

            body: {

                cardholderName: "Alice Tan",
                cardNumber: "",
                expiryMonth: "10",
                expiryYear: "2031",
                cvv: ""

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful card update ---
    it("should update the selected card successfully", async () => {

        cardModel.updateCard
            .mockResolvedValue();

        await cardController.updateCard(req, res);

        expect(cardModel.updateCard)
            .toHaveBeenCalledWith(

                1,
                "5",
                "Alice Tan",
                "",
                "10",
                "2031",
                ""

            );

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Card updated successfully."

            });

    });


    // --- Test Case 2: Card not found ---
    it("should return 404 if the card is not found", async () => {

        cardModel.updateCard.mockRejectedValue(

            new Error("Card not found.")

        );

        await cardController.updateCard(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Card not found."

            });

    });


    // --- Test Case 3: Unexpected model error ---
    it("should return 500 if updating the card fails", async () => {

        cardModel.updateCard.mockRejectedValue(

            new Error("Database error")

        );

        await cardController.updateCard(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Unable to update card."

            });

    });

});


// Set default card tests
describe("CardController.setDefaultCard", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1

            },

            params: {

                cardId: "5"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Default card updated ---
    it("should set the selected card as default", async () => {

        cardModel.setDefaultCard
            .mockResolvedValue();

        await cardController.setDefaultCard(
            req,
            res
        );

        expect(cardModel.setDefaultCard)
            .toHaveBeenCalledWith(

                1,
                "5"

            );

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Default payment method updated."

            });

    });


    // --- Test Case 2: Card not found ---
    it("should return 404 if the card is not found", async () => {

        cardModel.setDefaultCard.mockRejectedValue(

            new Error("Card not found.")

        );

        await cardController.setDefaultCard(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Card not found."

            });

    });


    // --- Test Case 3: Unexpected model error ---
    it("should return 500 if setting the default card fails", async () => {

        cardModel.setDefaultCard.mockRejectedValue(

            new Error("Database error")

        );

        await cardController.setDefaultCard(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Unable to set default card."

            });

    });

});


// Delete card tests
describe("CardController.deleteCard", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1

            },

            params: {

                cardId: "5"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Card deleted successfully ---
    it("should delete the selected card", async () => {

        cardModel.deleteCard
            .mockResolvedValue(true);

        await cardController.deleteCard(
            req,
            res
        );

        expect(cardModel.deleteCard)
            .toHaveBeenCalledWith(

                1,
                "5"

            );

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Card deleted successfully."

            });

    });


    // --- Test Case 2: Card not found ---
    it("should return 404 if the card cannot be found", async () => {

        cardModel.deleteCard
            .mockResolvedValue(false);

        await cardController.deleteCard(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Card not found."

            });

    });


    // --- Test Case 3: Model error ---
    it("should return 500 if deleting the card fails", async () => {

        cardModel.deleteCard.mockRejectedValue(

            new Error("Database error")

        );

        await cardController.deleteCard(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Unable to delete card."

            });

    });

});


// Get default card tests
describe("CardController.getDefaultCard", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Default card found ---
    it("should return the patron's default card", async () => {

        const card = {

            card_id: 5,
            cardholder_name: "Alice Tan",
            masked_card_number: "**** **** **** 1111",
            expiry_month: "12",
            expiry_year: "2030",
            is_default: true

        };

        cardModel.getDefaultCard
            .mockResolvedValue(card);

        await cardController.getDefaultCard(
            req,
            res
        );

        expect(cardModel.getDefaultCard)
            .toHaveBeenCalledWith(1);

        expect(res.json)
            .toHaveBeenCalledWith({

                hasDefaultCard: true,
                card

            });

    });


    // --- Test Case 2: No default card ---
    it("should return false if no default card exists", async () => {

        cardModel.getDefaultCard
            .mockResolvedValue(undefined);

        await cardController.getDefaultCard(
            req,
            res
        );

        expect(res.json)
            .toHaveBeenCalledWith({

                hasDefaultCard: false

            });

    });


    // --- Test Case 3: Model error ---
    it("should return 500 if loading the default card fails", async () => {

        cardModel.getDefaultCard.mockRejectedValue(

            new Error("Database error")

        );

        await cardController.getDefaultCard(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Unable to load default card."

            });

    });

});