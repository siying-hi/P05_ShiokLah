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

    window.location.href = "/select-role";

}

const orderMsg = document.getElementById("orderMsg");

const tryBtn = document.getElementById("tryBtn");

document.addEventListener("DOMContentLoaded", () => {

    orderMsg.textContent =
        "Payment could not be processed. Please try another payment method.";

});

tryBtn.addEventListener("click", () => {

    window.location.href = "/checkout";

});