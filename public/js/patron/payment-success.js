import { apiFetch } from "../utility/api.js";

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {

    window.location.href = "/select-role";

}

try {

    const payload = JSON.parse(

        atob(accessToken.split(".")[1])

    );

    if (payload.role !== "patron") {

        window.location.href = "/select-role";

    }

}
catch {

    sessionStorage.clear();

    alert("Invalid session. Please log in again.");

    window.location.href = "/select-role";

}

const params = new URLSearchParams(window.location.search);

const orderId = params.get("orderId");

const orderMsg = document.getElementById("orderMsg");
const reviewBtn = document.getElementById("reviewBtn");
const backBtn = document.getElementById("backBtn");

document.addEventListener("DOMContentLoaded", () => {

    if (!orderId) {

        orderMsg.textContent =
            "Payment successful, but the order number could not be found.";

        return;

    }

    orderMsg.textContent =
        `Your payment was successful! Your order #${orderId} has been placed.`;

    reviewBtn.disabled = false;

});

reviewBtn.addEventListener("click", () => {

    window.location.href =
        `/order-status?orderId=${orderId}`;

});

backBtn.addEventListener("click", () => {

    window.location.href = "/patron-homepage";

});