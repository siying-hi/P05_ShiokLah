const sql = require("mssql");

const orderModel =
    require("../../models/orderModel");


jest.mock("mssql");


// Checkout unit tests
describe("OrderModel.checkout", () => {

    let mockConnection;
    let mockTransaction;

    let getCartRequest;
    let createOrderRequest;
    let firstOrderItemRequest;
    let secondOrderItemRequest;
    let clearCartRequest;
    let deleteCartRequest;


    beforeEach(() => {

        jest.resetAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});


        // Request used to retrieve the patron's cart items
        getCartRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };


        // Request used to create the order
        createOrderRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };


        // Request used to insert the first order item
        firstOrderItemRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };


        // Request used to insert the second order item
        secondOrderItemRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };


        // Request used to clear the cart items
        clearCartRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };


        // Request used to delete the empty cart
        deleteCartRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };


        mockConnection = {

            close: jest.fn()

        };


        mockTransaction = {

            begin: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn()

        };


        sql.connect.mockResolvedValue(
            mockConnection
        );


        sql.Transaction.mockImplementation(
            () => mockTransaction
        );


        // The SQL requests are created in this order:
        // 1. Retrieve cart items
        // 2. Create order
        // 3. Insert first order item
        // 4. Insert second order item
        // 5. Clear cart items
        // 6. Delete cart
        sql.Request

            .mockImplementationOnce(
                () => getCartRequest
            )

            .mockImplementationOnce(
                () => createOrderRequest
            )

            .mockImplementationOnce(
                () => firstOrderItemRequest
            )

            .mockImplementationOnce(
                () => secondOrderItemRequest
            )

            .mockImplementationOnce(
                () => clearCartRequest
            )

            .mockImplementationOnce(
                () => deleteCartRequest
            );

    });


    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful dine-in checkout ---
    it("should create a dine-in order successfully", async () => {

        getCartRequest.query.mockResolvedValue({

            recordset: [

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 5,
                    quantity: 2,
                    price: 5
                },

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 6,
                    quantity: 1,
                    price: 3
                }

            ]

        });


        createOrderRequest.query.mockResolvedValue({

            recordset: [

                {
                    order_id: 20
                }

            ]

        });


        firstOrderItemRequest.query
            .mockResolvedValue({});

        secondOrderItemRequest.query
            .mockResolvedValue({});

        clearCartRequest.query
            .mockResolvedValue({});

        deleteCartRequest.query
            .mockResolvedValue({});


        const result =
            await orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            );


        expect(sql.connect)
            .toHaveBeenCalledWith(
                expect.any(Object)
            );


        expect(sql.Transaction)
            .toHaveBeenCalledWith(
                mockConnection
            );


        expect(mockTransaction.begin)
            .toHaveBeenCalledTimes(1);


        expect(getCartRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );


        expect(getCartRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "FROM Carts"
                )

            );


        expect(createOrderRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );


        expect(createOrderRequest.input)
            .toHaveBeenCalledWith(

                "stallId",
                sql.Int,
                3

            );


        expect(createOrderRequest.input)
            .toHaveBeenCalledWith(

                "orderMode",
                sql.VarChar,
                "Dine-In"

            );


        expect(createOrderRequest.input)
            .toHaveBeenCalledWith(

                "paymentMethod",
                sql.VarChar,
                "Cash"

            );


        // Subtotal:
        // (5 × 2) + (3 × 1) = 13
        expect(createOrderRequest.input)
            .toHaveBeenCalledWith(

                "subtotal",
                sql.Decimal(10, 2),
                13

            );


        expect(createOrderRequest.input)
            .toHaveBeenCalledWith(

                "packagingFee",
                sql.Decimal(10, 2),
                0

            );


        expect(createOrderRequest.input)
            .toHaveBeenCalledWith(

                "totalPrice",
                sql.Decimal(10, 2),
                13

            );


        expect(createOrderRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "INSERT INTO Orders"
                )

            );


        expect(firstOrderItemRequest.input)
            .toHaveBeenCalledWith(

                "orderId",
                sql.Int,
                20

            );


        expect(firstOrderItemRequest.input)
            .toHaveBeenCalledWith(

                "itemId",
                sql.Int,
                5

            );


        expect(firstOrderItemRequest.input)
            .toHaveBeenCalledWith(

                "quantity",
                sql.Int,
                2

            );


        expect(firstOrderItemRequest.input)
            .toHaveBeenCalledWith(

                "price",
                sql.Decimal(10, 2),
                5

            );


        expect(secondOrderItemRequest.input)
            .toHaveBeenCalledWith(

                "itemId",
                sql.Int,
                6

            );


        expect(clearCartRequest.input)
            .toHaveBeenCalledWith(

                "cartId",
                sql.Int,
                10

            );


        expect(clearCartRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM CartItems"
                )

            );


        expect(deleteCartRequest.input)
            .toHaveBeenCalledWith(

                "cartId",
                sql.Int,
                10

            );


        expect(deleteCartRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "DELETE FROM Carts"
                )

            );


        expect(mockTransaction.commit)
            .toHaveBeenCalledTimes(1);


        expect(mockTransaction.rollback)
            .not.toHaveBeenCalled();


        expect(result).toEqual({

            orderId: 20,
            subtotal: 13,
            packagingFee: 0,
            totalPrice: 13

        });


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Successful self-pickup checkout ---
    it("should calculate packaging fee for self-pickup order", async () => {

        getCartRequest.query.mockResolvedValue({

            recordset: [

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 5,
                    quantity: 2,
                    price: 5
                },

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 6,
                    quantity: 1,
                    price: 3
                }

            ]

        });


        createOrderRequest.query.mockResolvedValue({

            recordset: [

                {
                    order_id: 21
                }

            ]

        });


        firstOrderItemRequest.query
            .mockResolvedValue({});

        secondOrderItemRequest.query
            .mockResolvedValue({});

        clearCartRequest.query
            .mockResolvedValue({});

        deleteCartRequest.query
            .mockResolvedValue({});


        const result =
            await orderModel.checkout(

                1,
                "Self-Pickup",
                "Visa"

            );


        // Find the packaging-fee input call
        const packagingFeeCall =
            createOrderRequest.input.mock.calls.find(

                call =>
                    call[0] === "packagingFee"

            );


        expect(packagingFeeCall)
            .toBeDefined();


        // Total quantity:
        // 2 + 1 = 3
        // Packaging fee:
        // 3 × $0.30 = $0.90
        expect(packagingFeeCall[2])
            .toBeCloseTo(0.9, 2);


        // Find the total-price input call
        const totalPriceCall =
            createOrderRequest.input.mock.calls.find(

                call =>
                    call[0] === "totalPrice"

            );


        expect(totalPriceCall)
            .toBeDefined();


        expect(totalPriceCall[2])
            .toBeCloseTo(13.9, 2);


        expect(result.orderId)
            .toBe(21);


        expect(result.subtotal)
            .toBe(13);


        expect(result.packagingFee)
            .toBeCloseTo(0.9, 2);


        expect(result.totalPrice)
            .toBeCloseTo(13.9, 2);


        expect(mockTransaction.commit)
            .toHaveBeenCalledTimes(1);


        expect(mockTransaction.rollback)
            .not.toHaveBeenCalled();


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Empty cart ---
    it("should throw an error and rollback if cart is empty", async () => {

        getCartRequest.query.mockResolvedValue({

            recordset: []

        });


        await expect(

            orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            )

        ).rejects.toThrow(
            "Cart is empty."
        );


        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);


        expect(mockTransaction.commit)
            .not.toHaveBeenCalled();


        expect(createOrderRequest.query)
            .not.toHaveBeenCalled();


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 4: Cart retrieval error ---
    it("should rollback if retrieving cart items fails", async () => {

        getCartRequest.query.mockRejectedValue(

            new Error("Cart query failed")

        );


        await expect(

            orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            )

        ).rejects.toThrow(
            "Cart query failed"
        );


        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);


        expect(mockTransaction.commit)
            .not.toHaveBeenCalled();


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 5: Order creation error ---
    it("should rollback if creating the order fails", async () => {

        getCartRequest.query.mockResolvedValue({

            recordset: [

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 5,
                    quantity: 1,
                    price: 5
                },

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 6,
                    quantity: 1,
                    price: 3
                }

            ]

        });


        createOrderRequest.query.mockRejectedValue(

            new Error("Order creation failed")

        );


        await expect(

            orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            )

        ).rejects.toThrow(
            "Order creation failed"
        );


        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);


        expect(mockTransaction.commit)
            .not.toHaveBeenCalled();


        expect(firstOrderItemRequest.query)
            .not.toHaveBeenCalled();


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 6: Order item insertion error ---
    it("should rollback if inserting an order item fails", async () => {

        getCartRequest.query.mockResolvedValue({

            recordset: [

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 5,
                    quantity: 1,
                    price: 5
                },

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 6,
                    quantity: 1,
                    price: 3
                }

            ]

        });


        createOrderRequest.query.mockResolvedValue({

            recordset: [

                {
                    order_id: 20
                }

            ]

        });


        firstOrderItemRequest.query.mockRejectedValue(

            new Error("Order item insertion failed")

        );


        await expect(

            orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            )

        ).rejects.toThrow(
            "Order item insertion failed"
        );


        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);


        expect(mockTransaction.commit)
            .not.toHaveBeenCalled();


        expect(clearCartRequest.query)
            .not.toHaveBeenCalled();


        expect(deleteCartRequest.query)
            .not.toHaveBeenCalled();


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 7: Clear cart items error ---
    it("should rollback if clearing cart items fails", async () => {

        getCartRequest.query.mockResolvedValue({

            recordset: [

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 5,
                    quantity: 1,
                    price: 5
                },

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 6,
                    quantity: 1,
                    price: 3
                }

            ]

        });


        createOrderRequest.query.mockResolvedValue({

            recordset: [

                {
                    order_id: 20
                }

            ]

        });


        firstOrderItemRequest.query
            .mockResolvedValue({});

        secondOrderItemRequest.query
            .mockResolvedValue({});

        clearCartRequest.query.mockRejectedValue(

            new Error("Clear cart failed")

        );


        await expect(

            orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            )

        ).rejects.toThrow(
            "Clear cart failed"
        );


        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);


        expect(mockTransaction.commit)
            .not.toHaveBeenCalled();


        expect(deleteCartRequest.query)
            .not.toHaveBeenCalled();


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 8: Delete cart error ---
    it("should rollback if deleting the cart fails", async () => {

        getCartRequest.query.mockResolvedValue({

            recordset: [

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 5,
                    quantity: 1,
                    price: 5
                },

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 6,
                    quantity: 1,
                    price: 3
                }

            ]

        });


        createOrderRequest.query.mockResolvedValue({

            recordset: [

                {
                    order_id: 20
                }

            ]

        });


        firstOrderItemRequest.query
            .mockResolvedValue({});

        secondOrderItemRequest.query
            .mockResolvedValue({});

        clearCartRequest.query
            .mockResolvedValue({});

        deleteCartRequest.query.mockRejectedValue(

            new Error("Delete cart failed")

        );


        await expect(

            orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            )

        ).rejects.toThrow(
            "Delete cart failed"
        );


        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);


        expect(mockTransaction.commit)
            .not.toHaveBeenCalled();


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 9: Transaction commit error ---
    it("should rollback if transaction commit fails", async () => {

        getCartRequest.query.mockResolvedValue({

            recordset: [

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 5,
                    quantity: 1,
                    price: 5
                },

                {
                    cart_id: 10,
                    stall_id: 3,
                    item_id: 6,
                    quantity: 1,
                    price: 3
                }

            ]

        });


        createOrderRequest.query.mockResolvedValue({

            recordset: [

                {
                    order_id: 20
                }

            ]

        });


        firstOrderItemRequest.query
            .mockResolvedValue({});

        secondOrderItemRequest.query
            .mockResolvedValue({});

        clearCartRequest.query
            .mockResolvedValue({});

        deleteCartRequest.query
            .mockResolvedValue({});


        mockTransaction.commit.mockRejectedValue(

            new Error("Commit failed")

        );


        await expect(

            orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            )

        ).rejects.toThrow(
            "Commit failed"
        );


        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 10: Rollback error ---
    it("should still throw original error if rollback fails", async () => {

        getCartRequest.query.mockRejectedValue(

            new Error("Cart query failed")

        );


        mockTransaction.rollback.mockRejectedValue(

            new Error("Rollback failed")

        );


        await expect(

            orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            )

        ).rejects.toThrow(
            "Cart query failed"
        );


        expect(mockTransaction.rollback)
            .toHaveBeenCalledTimes(1);


        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 11: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database error")

        );


        await expect(

            orderModel.checkout(

                1,
                "Dine-In",
                "Cash"

            )

        ).rejects.toThrow(
            "Database error"
        );


        expect(mockTransaction.begin)
            .not.toHaveBeenCalled();


        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});