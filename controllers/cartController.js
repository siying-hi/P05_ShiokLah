const cartModel = require("../models/cartModel");

// Get cart
// Retrieves the logged-in patron's cart and all items currently inside it
async function getCart(req, res) {

    try {

        const patronId = req.user.id;

        const cart = await cartModel.getCartByPatronId(patronId);

        if (!cart) {

            return res.json({
                cartItems: []
            });

        }

        const cartItems =
            await cartModel.getCartItems(cart.cart_id);

        return res.json({

            cart_id: cart.cart_id,
            cartItems

        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({

            message: "Unable to load cart."

        });

    }

}


// Add item to cart
// Adds a menu item to the logged-in patron's cart
// Creates a new cart if one does not already exist
async function addToCart(req, res) {

    try {

        const patronId = req.user.id;
        const { itemId } = req.body;

        if (!itemId) {

            return res.status(400).json({
                message: "Item ID is required."
            });

        }

        // Check that the requested menu item exists
        const menuItem = await cartModel.getMenuItem(itemId);

        if (!menuItem) {

            return res.status(404).json({
                message: "Menu item not found."
            });

        }

        let cart = await cartModel.getCartByPatronId(patronId);

        // Create a new cart for the patron if none exists
        if (!cart) {

            const cartId = await cartModel.createCart(
                patronId,
                menuItem.stall_id
            );

            await cartModel.insertCartItem(
                cartId,
                itemId
            );

            return res.status(201).json({
                message: "Item added to cart."
            });

        }

        // Ensure the cart only contains items from one stall
        if (cart.stall_id !== menuItem.stall_id) {

            return res.status(400).json({
                message:
                "Your cart already contains items from another stall. Please checkout or clear your cart first."
            });

        }

        // Prevent duplicate items from being added
        const existingItem = await cartModel.getCartItem(
            cart.cart_id,
            itemId
        );

        if (existingItem) {

            return res.status(409).json({
                message: "Item already exists in cart."
            });

        }

        await cartModel.insertCartItem(
            cart.cart_id,
            itemId
        );

        return res.status(201).json({
            message: "Item added to cart."
        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Unable to add item to cart."
        });

    }

}


// Update quantity
// Updates the quantity of an existing cart item
async function updateQuantity(req, res) {

    try {

        const patronId = req.user.id;
        const { itemId, quantity } = req.body;

        if (quantity < 0) {

            return res.status(400).json({
                message: "Quantity cannot be negative."
            });

        }

        const cart = await cartModel.getCartByPatronId(patronId);

        if (!cart) {

            return res.status(404).json({
                message: "Cart not found."
            });

        }

        // Check that the requested item exists in the cart
        const existingItem = await cartModel.getCartItem(
            cart.cart_id,
            itemId
        );

        if (!existingItem) {

            return res.status(404).json({
                message: "Item not found in cart."
            });

        }

        // Quantity of zero is handled by the remove item endpoint
        if (quantity === 0) {

            return res.status(400).json({
                message: "Quantity cannot be zero. Use Remove Item instead."
            });

        }

        const updated = await cartModel.updateQuantity(
            cart.cart_id,
            itemId,
            quantity
        );

        if (!updated) {

            return res.status(404).json({

                message: "Item not found in cart."

            });

        }

        return res.status(200).json({
            message: "Quantity updated."
        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Unable to update quantity."
        });

    }

}


// Remove item
// Removes a single item from the logged-in patron's cart
// Deletes the cart if it becomes empty afterwards
async function removeItem(req, res) {

    try {

        const patronId = req.user.id;

        const itemId = parseInt(req.params.itemId);

        const cart = await cartModel.getCartByPatronId(
            patronId
        );

        if (!cart) {

            return res.status(404).json({
                message: "Cart not found."
            });

        }

        // Check that the requested item exists before removing it
        const existingItem = await cartModel.getCartItem(
            cart.cart_id,
            itemId
        );

        if (!existingItem) {

            return res.status(404).json({
                message: "Item not found in cart."
            });

        }

        const deleted = await cartModel.deleteCartItem(
            cart.cart_id,
            itemId
        );

        if (!deleted) {

            return res.status(404).json({

                message: "Item not found in cart."

            });

        }

        // Delete the cart if no items remain
        const items = await cartModel.getCartItems(
            cart.cart_id
        );

        if (items.length === 0) {

            await cartModel.deleteCart(
                cart.cart_id
            );

        }

        return res.status(200).json({

            message: "Item removed."

        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Unable to remove item."

        });

    }

}


// Clear cart
// Removes all items from the logged-in patron's cart
// Deletes the cart after all items have been removed
async function clearCart(req, res) {

    try {

        const patronId = req.user.id;

        const cart = await cartModel.getCartByPatronId(
            patronId
        );

        if (!cart) {

            return res.status(404).json({

                message: "Cart not found."

            });

        }

        await cartModel.clearCartItems(
            cart.cart_id
        );

        const deleted = await cartModel.deleteCart(
            cart.cart_id
        );

        if (!deleted) {

            return res.status(500).json({

                message: "Unable to delete cart."

            });

        }

        return res.status(200).json({

            message: "Cart cleared."

        });

    }
    catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Unable to clear cart."

        });

    }

}

module.exports = {

    getCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart

};