function showMessage(message, color) {

    const messageBox = document.getElementById("message");

    if (Array.isArray(message)) {

        messageBox.innerHTML = message
            .map(error => `<div>${error}</div>`)
            .join("");

    }
    else {

        messageBox.textContent = message;

    }

    messageBox.style.color = color;

}

const apiBaseUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {

    const username = sessionStorage.getItem("currentUser");

    if (!username) {

        window.location.href = "/find-account";
        return;

    }

        document
        .querySelector(".backBtn")
        .addEventListener("click", () => {

            window.location.href = "/find-account";

        });

    document
        .getElementById("resetPasswordBtn")
        .addEventListener("click", resetPassword);

});

async function resetPassword() {

    const username = sessionStorage.getItem("currentUser");
    const role = sessionStorage.getItem("selectedRole");

    const newPassword = document
        .getElementById("newPassword")
        .value;

    const confirmPassword = document
        .getElementById("confirmPassword2")
        .value;

    try {

        const response = await fetch(`${apiBaseUrl}/reset-password`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                role,
                username,
                newPassword,
                confirmPassword

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

        showMessage(
            "Password reset successfully!",
            "green"
        );

        sessionStorage.removeItem("currentUser");
        sessionStorage.removeItem("verificationCode");

        setTimeout(() => {

            window.location.href = "/login";

        }, 1000);

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            "red"
        );

    }

}

document.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        resetPassword();

    }

});