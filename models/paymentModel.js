// Simulate payment
// Does not interact with database but is placed in the model since controller should not handle actual payment processing logic
async function processPayment(paymentMethod) {

    if (paymentMethod === "Cash") {

        return true;

    }
    else if (paymentMethod === "Mastercard") {

        return true;

    }
    else if (paymentMethod === "Visa") {

        // 80% chance of failure
        return Math.random() >= 0.8;

    }
    else {

        return false;

    }

}

module.exports = {

    processPayment

};