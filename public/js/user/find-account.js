function showMessage(message, color) {

    const messageBox = document.getElementById("message");

    if (Array.isArray(message)) {
        messageBox.innerHTML = message
            .map(err => `<div>${err}</div>`)
            .join("");
    }
    else {
        messageBox.textContent = message;
    }

    messageBox.style.color = color;

}

const apiBaseUrl = "http://localhost:3000";


document.addEventListener("DOMContentLoaded", () => {

    document
        .getElementById("continueBtn")
        .addEventListener("click", retrieveAccount);

    document.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {
            retrieveAccount();
        }

    });

});

async function retrieveAccount() {

    const username = document
        .getElementById("username")
        .value
        .trim();
    const role = sessionStorage.getItem("selectedRole");

    try {

        const response = await fetch(`${apiBaseUrl}/find-account`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                role,
                username
            })

        });

        const data = await response.json();

        if (!response.ok) {

            showMessage(
                data.errors ||
                data.message,
                "red"
            );

        return;

        }

        sessionStorage.setItem("currentUser", username);

        sessionStorage.setItem(
            "verificationCode",
            data.verificationCode
        );

        window.location.href = "/confirm-account";

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            "red"
        );

    }

}