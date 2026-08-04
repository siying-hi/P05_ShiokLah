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
        .getElementById("primaryBtn")
        .addEventListener("click", verifyCode);

    document
        .getElementById("resendBtn")
        .addEventListener("click", resendCode);

    document
        .querySelector(".backBtn")
        .addEventListener("click", () => {

            window.location.href = "/find-account";

        });

    document.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            verifyCode();
        }

    });

});

document.addEventListener("DOMContentLoaded", () => {

    const code = sessionStorage.getItem("verificationCode");

    if (!code) {

        window.location.href = "/find-account";
        return;

    }

    alert(`Verification Code: ${code}`);

});

async function verifyCode() {

    const enteredCode = document
        .getElementById("code")
        .value
        .trim();

    const expectedCode = sessionStorage.getItem("verificationCode");

    try {

        const response = await fetch(`${apiBaseUrl}/confirm-account`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                enteredCode,
                expectedCode

            })

        });

        const data = await response.json();

        if (!response.ok) {

            showMessage(
                data.errors || data.message,
                "red"
            );

            return;

        }

        sessionStorage.removeItem("verificationCode");

        showMessage(
            "Verification successful!",
            "green"
        );

        setTimeout(() => {

            window.location.href = "/reset-password";

        }, 800);

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            "red"
        );

    }

}

async function resendCode() {

    const role = sessionStorage.getItem("selectedRole");
    const username = sessionStorage.getItem("currentUser");

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

        sessionStorage.setItem(
            "verificationCode",
            data.verificationCode
        );

        alert(
            `New Verification Code: ${data.verificationCode}`
        );

        showMessage(
            "A new code has been generated.",
            "green"
        );

    }
    catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            "red"
        );

    }

}