jest.mock("../../models/paymentModel", () => ({

    processPayment: jest.fn()

}));

jest.mock("../../models/orderModel", () => ({

    checkout: jest.fn()

}));

jest.mock("../../models/cardModel", () => ({

    getDefaultCard: jest.fn()

}));

jest.mock("../../models/cartModel", () => ({

    getCartByPatronId: jest.fn(),
    getCartItems: jest.fn()

}));


const paymentModel =
    require("../../models/paymentModel");

const orderModel =
    require("../../models/orderModel");

const cardModel =
    require("../../models/cardModel");

const cartModel =
    require("../../models/cartModel");

const paymentController =
    require("../../controllers/paymentController");


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


// Process payment tests
describe("PaymentController.processPayment", () => {

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

                orderMode: "Dine-In",
                paymentMethod: "Cash"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful cash payment ---
    it("should process cash payment successfully", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10,
                patron_id: 1,
                stall_id: 3

            });

        cartModel.getCartItems
            .mockResolvedValue([

                {
                    item_id: 5,
                    quantity: 2

                }

            ]);

        paymentModel.processPayment
            .mockResolvedValue(true);

        orderModel.checkout
            .mockResolvedValue({

                orderId: 15,
                subtotal: 10,
                packagingFee: 0,
                totalPrice: 10

            });

        await paymentController.processPayment(
            req,
            res
        );

        expect(cartModel.getCartByPatronId)
            .toHaveBeenCalledWith(1);

        expect(cartModel.getCartItems)
            .toHaveBeenCalledWith(10);

        expect(paymentModel.processPayment)
            .toHaveBeenCalledWith("Cash");

        expect(orderModel.checkout)
            .toHaveBeenCalledWith(

                1,
                "Dine-In",
                "Cash"

            );

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: true,
                message: "Payment successful.",
                orderId: 15,
                subtotal: 10,
                packagingFee: 0,
                totalPrice: 10

            });

    });


    // --- Test Case 2: Successful Visa payment ---
    it("should process Visa payment when a default card exists", async () => {

        req.body = {

            orderMode: "Self-Pickup",
            paymentMethod: "Visa"

        };

        cardModel.getDefaultCard
            .mockResolvedValue({

                cardId: 5,
                cardNumber: "•••• •••• •••• 1111"

            });

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10,
                patron_id: 1,
                stall_id: 3

            });

        cartModel.getCartItems
            .mockResolvedValue([

                {
                    item_id: 5,
                    quantity: 2

                }

            ]);

        paymentModel.processPayment
            .mockResolvedValue(true);

        orderModel.checkout
            .mockResolvedValue({

                orderId: 16,
                subtotal: 12,
                packagingFee: 0.60,
                totalPrice: 12.60

            });

        await paymentController.processPayment(
            req,
            res
        );

        expect(cardModel.getDefaultCard)
            .toHaveBeenCalledWith(1);

        expect(cartModel.getCartByPatronId)
            .toHaveBeenCalledWith(1);

        expect(cartModel.getCartItems)
            .toHaveBeenCalledWith(10);

        expect(paymentModel.processPayment)
            .toHaveBeenCalledWith("Visa");

        expect(orderModel.checkout)
            .toHaveBeenCalledWith(

                1,
                "Self-Pickup",
                "Visa"

            );

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: true,
                message: "Payment successful.",
                orderId: 16,
                subtotal: 12,
                packagingFee: 0.60,
                totalPrice: 12.60

            });

    });


    // --- Test Case 3: No default Visa card ---
    it("should return 400 if Visa is selected without a default card", async () => {

        req.body.paymentMethod = "Visa";

        cardModel.getDefaultCard
            .mockResolvedValue(null);

        await paymentController.processPayment(
            req,
            res
        );

        expect(cardModel.getDefaultCard)
            .toHaveBeenCalledWith(1);

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "No default Visa card selected."

            });

        expect(cartModel.getCartByPatronId)
            .not.toHaveBeenCalled();

        expect(cartModel.getCartItems)
            .not.toHaveBeenCalled();

        expect(paymentModel.processPayment)
            .not.toHaveBeenCalled();

        expect(orderModel.checkout)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 4: Patron has no cart ---
    it("should return 400 if the patron has no cart", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue(null);

        await paymentController.processPayment(
            req,
            res
        );

        expect(cartModel.getCartByPatronId)
            .toHaveBeenCalledWith(1);

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Your cart is empty."

            });

        expect(cartModel.getCartItems)
            .not.toHaveBeenCalled();

        expect(paymentModel.processPayment)
            .not.toHaveBeenCalled();

        expect(orderModel.checkout)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 5: Existing cart has no items ---
    it("should return 400 if the cart contains no items", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItems
            .mockResolvedValue([]);

        await paymentController.processPayment(
            req,
            res
        );

        expect(cartModel.getCartItems)
            .toHaveBeenCalledWith(10);

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Your cart is empty."

            });

        expect(paymentModel.processPayment)
            .not.toHaveBeenCalled();

        expect(orderModel.checkout)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 6: Cart items result is null ---
    it("should return 400 if cart items cannot be found", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItems
            .mockResolvedValue(null);

        await paymentController.processPayment(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Your cart is empty."

            });

        expect(paymentModel.processPayment)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 7: Payment failed ---
    it("should return payment failed when payment is unsuccessful", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItems
            .mockResolvedValue([

                {
                    item_id: 5,
                    quantity: 1

                }

            ]);

        paymentModel.processPayment
            .mockResolvedValue(false);

        await paymentController.processPayment(
            req,
            res
        );

        expect(paymentModel.processPayment)
            .toHaveBeenCalledWith("Cash");

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Payment failed."

            });

        expect(orderModel.checkout)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 8: Cart becomes empty during checkout ---
    it("should return 400 if checkout reports an empty cart", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItems
            .mockResolvedValue([

                {
                    item_id: 5,
                    quantity: 1

                }

            ]);

        paymentModel.processPayment
            .mockResolvedValue(true);

        orderModel.checkout
            .mockRejectedValue(

                new Error("Cart is empty.")

            );

        await paymentController.processPayment(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Your cart is empty."

            });

    });


    // --- Test Case 9: Default card lookup error ---
    it("should return 500 if loading the default card fails", async () => {

        req.body.paymentMethod = "Visa";

        cardModel.getDefaultCard
            .mockRejectedValue(

                new Error("Database error")

            );

        await paymentController.processPayment(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Unable to process payment."

            });

        expect(cartModel.getCartByPatronId)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 10: Cart lookup error ---
    it("should return 500 if loading the cart fails", async () => {

        cartModel.getCartByPatronId
            .mockRejectedValue(

                new Error("Database error")

            );

        await paymentController.processPayment(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Unable to process payment."

            });

        expect(paymentModel.processPayment)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 11: Cart items lookup error ---
    it("should return 500 if loading cart items fails", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItems
            .mockRejectedValue(

                new Error("Database error")

            );

        await paymentController.processPayment(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Unable to process payment."

            });

        expect(paymentModel.processPayment)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 12: Payment model error ---
    it("should return 500 if payment processing fails unexpectedly", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItems
            .mockResolvedValue([

                {
                    item_id: 5,
                    quantity: 1

                }

            ]);

        paymentModel.processPayment
            .mockRejectedValue(

                new Error("Payment service error")

            );

        await paymentController.processPayment(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Unable to process payment."

            });

        expect(orderModel.checkout)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 13: Checkout error ---
    it("should return 500 if checkout fails unexpectedly", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItems
            .mockResolvedValue([

                {
                    item_id: 5,
                    quantity: 1

                }

            ]);

        paymentModel.processPayment
            .mockResolvedValue(true);

        orderModel.checkout
            .mockRejectedValue(

                new Error("Database error")

            );

        await paymentController.processPayment(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                success: false,
                message: "Unable to process payment."

            });

    });

});