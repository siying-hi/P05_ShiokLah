jest.mock("../../models/cartModel", () => ({

    getCartByPatronId: jest.fn(),
    getCartItems: jest.fn(),
    getMenuItem: jest.fn(),
    createCart: jest.fn(),
    insertCartItem: jest.fn(),
    getCartItem: jest.fn(),
    updateQuantity: jest.fn(),
    deleteCartItem: jest.fn(),
    deleteCart: jest.fn(),
    clearCartItems: jest.fn()

}));

const cartModel =
    require("../../models/cartModel");

const cartController =
    require("../../controllers/cartController");


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


// Get cart tests
describe("CartController.getCart", () => {

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


    // --- Test Case 1: Cart found ---
    it("should return the patron's cart items", async () => {

        const cart = {

            cart_id: 10,
            patron_id: 1,
            stall_id: 3

        };

        const cartItems = [

            {
                item_id: 5,
                item_name: "Chicken Rice",
                quantity: 2
            }

        ];

        cartModel.getCartByPatronId
            .mockResolvedValue(cart);

        cartModel.getCartItems
            .mockResolvedValue(cartItems);

        await cartController.getCart(req, res);

        expect(cartModel.getCartByPatronId)
            .toHaveBeenCalledWith(1);

        expect(cartModel.getCartItems)
            .toHaveBeenCalledWith(10);

        expect(res.json)
            .toHaveBeenCalledWith({

                cart_id: 10,
                cartItems

            });

    });


    // --- Test Case 2: No cart found ---
    it("should return an empty cart if patron has no cart", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue(null);

        await cartController.getCart(req, res);

        expect(res.json)
            .toHaveBeenCalledWith({

                cartItems: []

            });

        expect(cartModel.getCartItems)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 3: Model error ---
    it("should return 500 if loading the cart fails", async () => {

        cartModel.getCartByPatronId
            .mockRejectedValue(

                new Error("Database error")

            );

        await cartController.getCart(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Unable to load cart."

            });

    });

});


// Add to cart tests
describe("CartController.addToCart", () => {

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

                itemId: 5

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Missing item ID ---
    it("should return 400 if item ID is missing", async () => {

        req.body = {};

        await cartController.addToCart(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item ID is required."

            });

        expect(cartModel.getMenuItem)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 2: Menu item not found ---
    it("should return 404 if menu item does not exist", async () => {

        cartModel.getMenuItem
            .mockResolvedValue(null);

        await cartController.addToCart(req, res);

        expect(cartModel.getMenuItem)
            .toHaveBeenCalledWith(5);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Menu item not found."

            });

    });


    // --- Test Case 3: Create new cart and add item ---
    it("should create a new cart and add the item", async () => {

        cartModel.getMenuItem
            .mockResolvedValue({

                item_id: 5,
                stall_id: 3

            });

        cartModel.getCartByPatronId
            .mockResolvedValue(null);

        cartModel.createCart
            .mockResolvedValue(10);

        cartModel.insertCartItem
            .mockResolvedValue();

        await cartController.addToCart(req, res);

        expect(cartModel.createCart)
            .toHaveBeenCalledWith(
                1,
                3
            );

        expect(cartModel.insertCartItem)
            .toHaveBeenCalledWith(
                10,
                5
            );

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item added to cart."

            });

    });


    // --- Test Case 4: Item belongs to another stall ---
    it("should return 400 if item belongs to another stall", async () => {

        cartModel.getMenuItem
            .mockResolvedValue({

                item_id: 5,
                stall_id: 4

            });

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10,
                stall_id: 3

            });

        await cartController.addToCart(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                "Your cart already contains items from another stall. Please checkout or clear your cart first."

            });

        expect(cartModel.getCartItem)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 5: Duplicate item ---
    it("should return 409 if item already exists in cart", async () => {

        cartModel.getMenuItem
            .mockResolvedValue({

                item_id: 5,
                stall_id: 3

            });

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10,
                stall_id: 3

            });

        cartModel.getCartItem
            .mockResolvedValue({

                item_id: 5

            });

        await cartController.addToCart(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(409);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item already exists in cart."

            });

        expect(cartModel.insertCartItem)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 6: Add item to existing cart ---
    it("should add item to an existing cart", async () => {

        cartModel.getMenuItem
            .mockResolvedValue({

                item_id: 5,
                stall_id: 3

            });

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10,
                stall_id: 3

            });

        cartModel.getCartItem
            .mockResolvedValue(null);

        cartModel.insertCartItem
            .mockResolvedValue();

        await cartController.addToCart(req, res);

        expect(cartModel.insertCartItem)
            .toHaveBeenCalledWith(
                10,
                5
            );

        expect(res.status)
            .toHaveBeenCalledWith(201);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item added to cart."

            });

    });


    // --- Test Case 7: Model error ---
    it("should return 500 if adding item fails", async () => {

        cartModel.getMenuItem
            .mockRejectedValue(

                new Error("Database error")

            );

        await cartController.addToCart(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Unable to add item to cart."

            });

    });

});


// Update quantity tests
describe("CartController.updateQuantity", () => {

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

                itemId: 5,
                quantity: 2

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Negative quantity ---
    it("should return 400 if quantity is negative", async () => {

        req.body.quantity = -1;

        await cartController.updateQuantity(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Quantity cannot be negative."

            });

        expect(cartModel.getCartByPatronId)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 2: Cart not found ---
    it("should return 404 if cart does not exist", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue(null);

        await cartController.updateQuantity(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Cart not found."

            });

    });


    // --- Test Case 3: Item not found in cart ---
    it("should return 404 if item is not in cart", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItem
            .mockResolvedValue(null);

        await cartController.updateQuantity(req, res);

        expect(cartModel.getCartItem)
            .toHaveBeenCalledWith(
                10,
                5
            );

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item not found in cart."

            });

    });


    // --- Test Case 4: Quantity is zero ---
    it("should return 400 if quantity is zero", async () => {

        req.body.quantity = 0;

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItem
            .mockResolvedValue({

                item_id: 5

            });

        await cartController.updateQuantity(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(400);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                "Quantity cannot be zero. Use Remove Item instead."

            });

        expect(cartModel.updateQuantity)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 5: Update returns false ---
    it("should return 404 if quantity update fails", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItem
            .mockResolvedValue({

                item_id: 5

            });

        cartModel.updateQuantity
            .mockResolvedValue(false);

        await cartController.updateQuantity(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item not found in cart."

            });

    });


    // --- Test Case 6: Successful quantity update ---
    it("should update item quantity successfully", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItem
            .mockResolvedValue({

                item_id: 5

            });

        cartModel.updateQuantity
            .mockResolvedValue(true);

        await cartController.updateQuantity(req, res);

        expect(cartModel.updateQuantity)
            .toHaveBeenCalledWith(
                10,
                5,
                2
            );

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Quantity updated."

            });

    });


    // --- Test Case 7: Model error ---
    it("should return 500 if quantity update fails", async () => {

        cartModel.getCartByPatronId
            .mockRejectedValue(

                new Error("Database error")

            );

        await cartController.updateQuantity(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Unable to update quantity."

            });

    });

});


// Remove item tests
describe("CartController.removeItem", () => {

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

                itemId: "5"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Cart not found ---
    it("should return 404 if cart does not exist", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue(null);

        await cartController.removeItem(req, res);

        expect(cartModel.getCartByPatronId)
            .toHaveBeenCalledWith(1);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Cart not found."

            });

    });


    // --- Test Case 2: Item not found ---
    it("should return 404 if item does not exist in cart", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItem
            .mockResolvedValue(null);

        await cartController.removeItem(req, res);

        expect(cartModel.getCartItem)
            .toHaveBeenCalledWith(
                10,
                5
            );

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item not found in cart."

            });

    });


    // --- Test Case 3: Delete returns false ---
    it("should return 404 if cart item cannot be deleted", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItem
            .mockResolvedValue({

                item_id: 5

            });

        cartModel.deleteCartItem
            .mockResolvedValue(false);

        await cartController.removeItem(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item not found in cart."

            });

    });


    // --- Test Case 4: Remove item but keep cart ---
    it("should remove item and keep cart if items remain", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItem
            .mockResolvedValue({

                item_id: 5

            });

        cartModel.deleteCartItem
            .mockResolvedValue(true);

        cartModel.getCartItems
            .mockResolvedValue([

                {
                    item_id: 6

                }

            ]);

        await cartController.removeItem(req, res);

        expect(cartModel.deleteCartItem)
            .toHaveBeenCalledWith(
                10,
                5
            );

        expect(cartModel.deleteCart)
            .not.toHaveBeenCalled();

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item removed."

            });

    });


    // --- Test Case 5: Remove final item and delete cart ---
    it("should delete the cart if no items remain", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.getCartItem
            .mockResolvedValue({

                item_id: 5

            });

        cartModel.deleteCartItem
            .mockResolvedValue(true);

        cartModel.getCartItems
            .mockResolvedValue([]);

        cartModel.deleteCart
            .mockResolvedValue(true);

        await cartController.removeItem(req, res);

        expect(cartModel.getCartItems)
            .toHaveBeenCalledWith(10);

        expect(cartModel.deleteCart)
            .toHaveBeenCalledWith(10);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Item removed."

            });

    });


    // --- Test Case 6: Model error ---
    it("should return 500 if removing item fails", async () => {

        cartModel.getCartByPatronId
            .mockRejectedValue(

                new Error("Database error")

            );

        await cartController.removeItem(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Unable to remove item."

            });

    });

});


// Clear cart tests
describe("CartController.clearCart", () => {

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


    // --- Test Case 1: Cart not found ---
    it("should return 404 if cart does not exist", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue(null);

        await cartController.clearCart(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Cart not found."

            });

    });


    // --- Test Case 2: Cart deletion fails ---
    it("should return 500 if cart cannot be deleted", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.clearCartItems
            .mockResolvedValue();

        cartModel.deleteCart
            .mockResolvedValue(false);

        await cartController.clearCart(req, res);

        expect(cartModel.clearCartItems)
            .toHaveBeenCalledWith(10);

        expect(cartModel.deleteCart)
            .toHaveBeenCalledWith(10);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Unable to delete cart."

            });

    });


    // --- Test Case 3: Successful cart clearing ---
    it("should clear and delete the cart successfully", async () => {

        cartModel.getCartByPatronId
            .mockResolvedValue({

                cart_id: 10

            });

        cartModel.clearCartItems
            .mockResolvedValue();

        cartModel.deleteCart
            .mockResolvedValue(true);

        await cartController.clearCart(req, res);

        expect(cartModel.clearCartItems)
            .toHaveBeenCalledWith(10);

        expect(cartModel.deleteCart)
            .toHaveBeenCalledWith(10);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Cart cleared."

            });

    });


    // --- Test Case 4: Model error ---
    it("should return 500 if clearing the cart fails", async () => {

        cartModel.getCartByPatronId
            .mockRejectedValue(

                new Error("Database error")

            );

        await cartController.clearCart(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Unable to clear cart."

            });

    });

});