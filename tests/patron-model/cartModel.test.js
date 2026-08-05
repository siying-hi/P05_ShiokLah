const sql = require("mssql");

const cartModel =
    require("../../models/cartModel");


jest.mock("mssql");


// Get cart by patron unit tests
describe("CartModel.getCartByPatronId", () => {

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


    // --- Test Case 1: Cart found ---
    it("should return the patron's cart", async () => {

        const cart = {

            cart_id: 10,
            patron_id: 1,
            stall_id: 3

        };

        mockRequest.query.mockResolvedValue({

            recordset: [cart]

        });

        const result =
            await cartModel.getCartByPatronId(1);

        expect(sql.connect)
            .toHaveBeenCalledWith(expect.any(Object));

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "patronId",
                sql.Int,
                1
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM Carts")
            );

        expect(result).toEqual(cart);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Cart not found ---
    it("should return undefined if patron has no cart", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await cartModel.getCartByPatronId(1);

        expect(result).toBeUndefined();

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if loading the cart fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.getCartByPatronId(1)

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Create cart unit tests
describe("CartModel.createCart", () => {

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


    // --- Test Case 1: Successful cart creation ---
    it("should create a cart and return the new cart ID", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    cart_id: 10
                }

            ]

        });

        const result =
            await cartModel.createCart(
                1,
                3
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "patronId",
                sql.Int,
                1
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "stallId",
                sql.Int,
                3
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO Carts")
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "OUTPUT INSERTED.cart_id"
                )
            );

        expect(result).toBe(10);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Database error ---
    it("should throw an error if cart creation fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.createCart(
                1,
                3
            )

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Get menu item unit tests
describe("CartModel.getMenuItem", () => {

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


    // --- Test Case 1: Menu item found ---
    it("should return the selected menu item", async () => {

        const menuItem = {

            item_id: 5,
            stall_id: 3,
            item_name: "Chicken Rice",
            price: 5.50

        };

        mockRequest.query.mockResolvedValue({

            recordset: [menuItem]

        });

        const result =
            await cartModel.getMenuItem(5);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "itemId",
                sql.Int,
                5
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM MenuItem")
            );

        expect(result).toEqual(menuItem);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Menu item not found ---
    it("should return undefined if menu item is not found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await cartModel.getMenuItem(999);

        expect(result).toBeUndefined();

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if loading menu item fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.getMenuItem(5)

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Get cart item unit tests
describe("CartModel.getCartItem", () => {

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


    // --- Test Case 1: Cart item found ---
    it("should return the selected cart item", async () => {

        const cartItem = {

            cart_id: 10,
            item_id: 5,
            quantity: 2

        };

        mockRequest.query.mockResolvedValue({

            recordset: [cartItem]

        });

        const result =
            await cartModel.getCartItem(
                10,
                5
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "cartId",
                sql.Int,
                10
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "itemId",
                sql.Int,
                5
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("FROM CartItems")
            );

        expect(result).toEqual(cartItem);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Cart item not found ---
    it("should return undefined if cart item is not found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await cartModel.getCartItem(
                10,
                999
            );

        expect(result).toBeUndefined();

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if loading cart item fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.getCartItem(
                10,
                5
            )

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Insert cart item unit tests
describe("CartModel.insertCartItem", () => {

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


    // --- Test Case 1: Successful cart item insertion ---
    it("should insert a cart item with quantity one", async () => {

        mockRequest.query.mockResolvedValue({});

        await cartModel.insertCartItem(
            10,
            5
        );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "cartId",
                sql.Int,
                10
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "itemId",
                sql.Int,
                5
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO CartItems")
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining("1")
            );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Database error ---
    it("should throw an error if inserting cart item fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.insertCartItem(
                10,
                5
            )

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Update quantity unit tests
describe("CartModel.updateQuantity", () => {

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


    // --- Test Case 1: Successful quantity update ---
    it("should return true if quantity is updated", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        const result =
            await cartModel.updateQuantity(
                10,
                5,
                3
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "cartId",
                sql.Int,
                10
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "itemId",
                sql.Int,
                5
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "quantity",
                sql.Int,
                3
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "SET quantity = @quantity"
                )
            );

        expect(result).toBe(true);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Cart item not updated ---
    it("should return false if no cart item is updated", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [0]

        });

        const result =
            await cartModel.updateQuantity(
                10,
                999,
                3
            );

        expect(result).toBe(false);

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if quantity update fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.updateQuantity(
                10,
                5,
                3
            )

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Delete cart item unit tests
describe("CartModel.deleteCartItem", () => {

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


    // --- Test Case 1: Successful cart item deletion ---
    it("should return true if cart item is deleted", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        const result =
            await cartModel.deleteCartItem(
                10,
                5
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "cartId",
                sql.Int,
                10
            );

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "itemId",
                sql.Int,
                5
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "DELETE FROM CartItems"
                )
            );

        expect(result).toBe(true);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Cart item not deleted ---
    it("should return false if no cart item is deleted", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [0]

        });

        const result =
            await cartModel.deleteCartItem(
                10,
                999
            );

        expect(result).toBe(false);

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if cart item deletion fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.deleteCartItem(
                10,
                5
            )

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Clear cart items unit tests
describe("CartModel.clearCartItems", () => {

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


    // --- Test Case 1: Successful cart clearing ---
    it("should return true if cart items are removed", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [2]

        });

        const result =
            await cartModel.clearCartItems(10);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "cartId",
                sql.Int,
                10
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "DELETE FROM CartItems"
                )
            );

        expect(result).toBe(true);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: No items removed ---
    it("should return false if cart contains no items", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [0]

        });

        const result =
            await cartModel.clearCartItems(10);

        expect(result).toBe(false);

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if clearing cart items fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.clearCartItems(10)

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Delete cart unit tests
describe("CartModel.deleteCart", () => {

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


    // --- Test Case 1: Successful cart deletion ---
    it("should return true if cart is deleted", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [1]

        });

        const result =
            await cartModel.deleteCart(10);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "cartId",
                sql.Int,
                10
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "DELETE FROM Carts"
                )
            );

        expect(result).toBe(true);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Cart not deleted ---
    it("should return false if cart is not found", async () => {

        mockRequest.query.mockResolvedValue({

            rowsAffected: [0]

        });

        const result =
            await cartModel.deleteCart(999);

        expect(result).toBe(false);

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if cart deletion fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.deleteCart(10)

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});


// Get cart items unit tests
describe("CartModel.getCartItems", () => {

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


    // --- Test Case 1: Cart items found ---
    it("should return all items in the cart", async () => {

        const cartItems = [

            {
                cart_id: 10,
                stall_name: "Ah Tan Chicken Rice",
                item_id: 5,
                item_name: "Chicken Rice",
                image_name: "chicken-rice.jpg",
                price: 5.50,
                quantity: 2,
                subtotal: 11.00
            },

            {
                cart_id: 10,
                stall_name: "Ah Tan Chicken Rice",
                item_id: 6,
                item_name: "Lemon Tea",
                image_name: "lemon-tea.jpg",
                price: 2.00,
                quantity: 1,
                subtotal: 2.00
            }

        ];

        mockRequest.query.mockResolvedValue({

            recordset: cartItems

        });

        const result =
            await cartModel.getCartItems(10);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(
                "cartId",
                sql.Int,
                10
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "INNER JOIN CartItems"
                )
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "INNER JOIN MenuItem"
                )
            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(
                expect.stringContaining(
                    "INNER JOIN Stalls"
                )
            );

        expect(result).toEqual(cartItems);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Cart contains no items ---
    it("should return an empty array if cart contains no items", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await cartModel.getCartItems(10);

        expect(result).toEqual([]);

    });


    // --- Test Case 3: Database error ---
    it("should throw an error if loading cart items fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            cartModel.getCartItems(10)

        ).rejects.toThrow("Database error");

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });

});