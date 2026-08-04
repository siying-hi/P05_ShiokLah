const membershipModal =
    document.getElementById("membershipModal");

const selectedPlanName =
    document.getElementById("selectedPlanName");

const membershipPaymentForm =
    document.getElementById(
        "membershipPaymentForm"
    );

const membershipPaymentError =
    document.getElementById(
        "membershipPaymentError"
    );

const cancelPlanBtn =
    document.getElementById("cancelPlanBtn");

const currentPlanName =
    document.getElementById("currentPlanName");

const currentPlanDescription =
    document.getElementById(
        "currentPlanDescription"
    );

const membershipToast =
    document.getElementById("membershipToast");


let pendingPlan = null;


// Description shown for each membership
const planDescriptions = {

    "Free Patron":
        "Enjoy the standard ShiokLah rewards programme.",

    "Shiok Saver":
        "Receive monthly vouchers, extra points and member-only promotions.",

    "Shiok Plus":
        "Enjoy additional discounts, free takeaway packaging and more points."

};


// Load membership information and buttons
document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateCurrentPlan();

        const planButtons =
            document.querySelectorAll(
                ".choose-plan-btn"
            );

        planButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    pendingPlan =
                        button.dataset.plan;


                    // Free plan does not need payment
                    if (
                        pendingPlan ===
                        "Free Patron"
                    ) {

                        savePlan(
                            pendingPlan
                        );

                        return;

                    }


                    // Paid plans open payment form
                    selectedPlanName.textContent =
                        pendingPlan;

                    membershipPaymentError.textContent =
                        "";

                    membershipPaymentForm.reset();

                    membershipModal.classList.add(
                        "show"
                    );

                }
            );

        });

    }
);


// Handle membership payment form
membershipPaymentForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (!pendingPlan) {

            membershipPaymentError.textContent =
                "Please select a membership plan.";

            return;

        }


        const cardName =
            document
                .getElementById(
                    "membershipCardName"
                )
                .value
                .trim();


        const cardNumber =
            document
                .getElementById(
                    "membershipCardNumber"
                )
                .value
                .replace(/\s/g, "");


        const expiry =
            document
                .getElementById(
                    "membershipExpiry"
                )
                .value;


        const cvv =
            document
                .getElementById(
                    "membershipCvv"
                )
                .value
                .trim();


        // Validate cardholder name
        if (cardName.length < 2) {

            membershipPaymentError.textContent =
                "Please enter the cardholder name.";

            return;

        }


        // Demo card number
        if (cardNumber !== "11111111") {

            membershipPaymentError.textContent =
                "For this demo, enter 11111111 as the card number.";

            return;

        }


        // Validate expiry date
        if (!expiry) {

            membershipPaymentError.textContent =
                "Please select the card expiry date.";

            return;

        }


        const currentMonth =
            new Date()
                .toISOString()
                .slice(0, 7);


        if (expiry < currentMonth) {

            membershipPaymentError.textContent =
                "The card has expired.";

            return;

        }


        // Demo CVV
        if (cvv !== "11111111") {

            membershipPaymentError.textContent =
                "For this demo, enter 11111111 as the CVV.";

            return;

        }


        // Simulated successful payment
        savePlan(
            pendingPlan
        );

    }
);


// Cancel current paid membership
cancelPlanBtn.addEventListener(
    "click",
    () => {

        const currentPlan =
            getCurrentPlan();


        if (currentPlan === "Free Patron") {

            showToast(
                "You do not have a paid membership to cancel."
            );

            return;

        }


        const confirmed =
            confirm(
                "Cancel your current membership and return to Free Patron?"
            );


        if (!confirmed) {
            return;
        }


        localStorage.setItem(
            "shioklahMembership",
            "Free Patron"
        );


        updateCurrentPlan();


        showToast(
            "Your membership has been changed to Free Patron."
        );

    }
);


// Close button inside payment modal
document
    .getElementById(
        "closeMembershipModal"
    )
    .addEventListener(
        "click",
        closeModal
    );


// Go Back button inside payment modal
document
    .getElementById(
        "cancelSelectionBtn"
    )
    .addEventListener(
        "click",
        closeModal
    );


// Close modal when clicking outside the card
membershipModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            membershipModal
        ) {

            closeModal();

        }

    }
);


// Get saved plan from localStorage
function getCurrentPlan() {

    return (
        localStorage.getItem(
            "shioklahMembership"
        ) || "Free Patron"
    );

}


// Update current membership display
function updateCurrentPlan() {

    const currentPlan =
        getCurrentPlan();


    currentPlanName.textContent =
        currentPlan;


    currentPlanDescription.textContent =
        planDescriptions[currentPlan] ||
        planDescriptions["Free Patron"];


    document
        .querySelectorAll(
            ".choose-plan-btn"
        )
        .forEach(button => {

            const selected =
                button.dataset.plan ===
                currentPlan;


            button.disabled =
                selected;


            button.classList.toggle(
                "selected",
                selected
            );


            if (selected) {

                button.textContent =
                    "Current Plan";

            }
            else if (
                button.dataset.plan ===
                "Free Patron"
            ) {

                button.textContent =
                    "Select Free";

            }
            else if (
                button.dataset.plan ===
                "Shiok Saver"
            ) {

                button.textContent =
                    "Choose Saver";

            }
            else {

                button.textContent =
                    "Choose Plus";

            }

        });


    // Only show cancel for paid plans
    cancelPlanBtn.style.display =
        currentPlan === "Free Patron"
            ? "none"
            : "inline-block";

}


// Save selected membership
function savePlan(planName) {

    localStorage.setItem(
        "shioklahMembership",
        planName
    );


    closeModal();

    updateCurrentPlan();


    showToast(
        `${planName} has been selected successfully.`
    );

}


// Close payment modal
function closeModal() {

    membershipModal.classList.remove(
        "show"
    );


    pendingPlan = null;


    membershipPaymentError.textContent =
        "";


    membershipPaymentForm.reset();

}


// Show temporary notification
function showToast(message) {

    membershipToast.textContent =
        message;


    membershipToast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            membershipToast.classList.remove(
                "show"
            );

        },
        2500
    );

}