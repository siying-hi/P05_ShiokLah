const paymentModel = require("../models/paymentModel");
const orderModel = require("../models/orderModel");
const cardModel = require("../models/cardModel");
const cartModel = require("../models/cartModel");

// Process payment
// Processes the patron's payment and creates an order if payment succeeds
async function processPayment(req, res) {

    try {

        const patronId = req.user.id;

        const {
            orderMode,
            paymentMethod
        } = req.body;

        // Ensure a default Visa card exists before processing Visa payments
        if (paymentMethod === "Visa") {

            const defaultCard =
                await cardModel.getDefaultCard(patronId);

            if (!defaultCard) {

                return res.status(400).json({

                    success: false,
                    message: "No default Visa card selected."

                });

            }

        }

        // Check whether the patron's cart is empty
        // Check whether the cart is empty before processing payment to avoid returning the generic "Payment fsiled." message
        const cart =
            await cartModel.getCartByPatronId(patronId);

        // Stop payment if the patron does not have a cart
        if (!cart) {

            return res.status(400).json({

                success: false,
                message: "Your cart is empty."

            });

        }

        // Retrieve the items inside the cart
        const cartItems =
            await cartModel.getCartItems(cart.cart_id);

        // Stop payment if the cart contains no items
        if (!cartItems || cartItems.length === 0) {

            return res.status(400).json({

                success: false,
                message: "Your cart is empty."

            });

        }

        // Simulate payment processing
        const paymentSuccessful =
            await paymentModel.processPayment(paymentMethod);

        if (!paymentSuccessful) {

            return res.status(200).json({

                success: false,
                message: "Payment failed."

            });

        }

        // Complete the checkout process
        // Creates the order, inserts all order items and clears the shopping cart
        const checkoutResult =
            await orderModel.checkout(

                patronId,
                orderMode,
                paymentMethod

            );

        return res.status(201).json({

            success: true,
            message: "Payment successful.",

            orderId: checkoutResult.orderId,
            subtotal: checkoutResult.subtotal,
            packagingFee: checkoutResult.packagingFee,
            totalPrice: checkoutResult.totalPrice

        });

    }

    catch (error) {

        console.error(error);

        // Checkout also checks the cart again in case it became empty after payment success
        if (error.message === "Cart is empty.") {

            return res.status(400).json({

                success: false,
                message: "Your cart is empty."

            });

        }

        return res.status(500).json({

            success: false,
            message: "Unable to process payment."

        });

    }

}

module.exports = {

    processPayment

};

// const paymentModel = require("../models/paymentModel");
// const orderModel = require("../models/orderModel");
// const cardModel = require("../models/cardModel");
// const cartModel = require("../models/cartModel");
// const rewardModel =
//     require("../models/rewardsModel");

// // Process payment
// // Processes the patron's payment and creates an order if payment succeeds
// async function processPayment(req, res) {

//     try {

//         const patronId = req.user.id;

// const {

//     orderMode,
//     paymentMethod,
//     rewardId

// } = req.body;
//         // Visa must have a default card
//         // Ensure a default Visa card exists before processing Visa payments
//         if (paymentMethod === "Visa") {

//             const defaultCard =
//                 await cardModel.getDefaultCard(patronId);

//             if (!defaultCard) {

//                 return res.status(400).json({

//                     success: false,
//                     message: "No default Visa card selected."

//                 });

//             }

//         }

        /* Legacy unmatched closing brace retained for reference.
        }
        */
// if (selectedReward) {
//         // Check whether the patron's cart is empty
//         // Check whether the cart is empty before processing payment to avoid hitting the generic "Payment fsiled." message
//         const cartItems =
//             await cartModel.getCartByPatronId(patronId);

//         if (!cartItems || cartItems.length === 0) {

//             return res.status(400).json({

//                 success: false,
//                 message: "Your cart is empty."

//             });

//         }

//         // Simulate payment processing
//         const paymentSuccessful =
//             await paymentModel.processPayment(paymentMethod);

//         if (!paymentSuccessful) {

//             return res.status(200).json({

//                 success: false,
//                 message: "Payment failed."

//             });

//         }

// //         let discount = 0;

// // let selectedReward = null;


// // if (rewardId) {

// //     selectedReward =
// //         await rewardModel.getRewardForCheckout(
// //             Number(rewardId),
// //             patronId
// //         );


// //     if (!selectedReward) {

// //         return res.status(400).json({

// //             message:
// //                 "Voucher is unavailable, used, expired or does not belong to you."

// //         });

// //     }


// //     if (
// //         subtotal <
// //         Number(selectedReward.minimum_spend)
// //     ) {

// //         return res.status(400).json({

// //             message:
// //                 `Minimum spending is $${Number(
// //                     selectedReward.minimum_spend
// //                 ).toFixed(2)}.`

// //         });

// //     }


// //     if (
// //         selectedReward.reward_type ===
// //         "Percentage"
// //     ) {

// //         discount =
// //             subtotal *
// //             (
// //                 Number(
// //                     selectedReward.reward_value
// //                 ) / 100
// //             );

// //     }
// //     else if (
// //         selectedReward.reward_type ===
// //         "Fixed"
// //     ) {

// //         discount =
// //             Number(
// //                 selectedReward.reward_value
// //             );

// //     }
// //     else if (
// //         selectedReward.reward_type ===
// //         "Free Takeaway"
// //     ) {

// //         discount = packagingFee;

// //     }

// // }


// // const beforeDiscount =
// //     subtotal + packagingFee;


// // if (discount > beforeDiscount) {

// //     discount = beforeDiscount;

// // }


// // const totalPrice =
// //     beforeDiscount - discount;

//         // Complete the checkout process
//         // Creates the order, inserts all order items and clears the shopping cart
//         const checkoutResult =
//             await orderModel.checkout(
//                 patronId,
//                 orderMode,
//                 paymentMethod

//             );

//         }
// // if (selectedReward) {

// //     const rewardUsed =
// //         await rewardModel.useReward(

// //             selectedReward.reward_id,

// //             patronId,

// //             selectedReward.points_required

// //         );

// //     }}


// //     if (!rewardUsed) {

// //         return res.status(400).json({

// //             message:
// //                 "The voucher could not be used."

// //         });

// //     }

// // }
// //         // Clear cart
// //         // Remove all items from the cart after the order is created
// //         await orderModel.clearCartItems(
// //             cartId
// //         );

// //         // Delete the empty cart
// //         await orderModel.deleteCart(
// //             cartId
// //         );

// //         return res.status(201).json({

// //             success: true,
// //             message: "Payment successful.",

// //             orderId: checkoutResult.orderId,
// //             subtotal: checkoutResult.subtotal,
// //             packagingFee: checkoutResult.packagingFee,
// //             totalPrice: checkoutResult.totalPrice
// // //             orderId,

// // //             subtotal,

// // //             packagingFee,
// // //             discount,

// // //             totalPrice

// //         });

//     catch (error) {

//         console.error(error);

//         // Checkout also checks the cart again in case it became empty after payment success
//         if (error.message === "Cart is empty.") {

//             return res.status(400).json({

//                 success: false,
//                 message: "Your cart is empty."

//             });

//         }

//         return res.status(500).json({

//             success: false,
//             message: "Unable to process payment."

//         });

//     }

// }

// module.exports = {

//     processPayment
// };
