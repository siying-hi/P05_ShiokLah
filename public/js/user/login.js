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

document.querySelector(".backBtn").addEventListener("click", () => {

    window.location.href = "/select-role";

});

document.getElementById("loginBtn").addEventListener("click", login);

document.addEventListener("DOMContentLoaded", () => {

    const role = sessionStorage.getItem("selectedRole");

    if (role === "vendor" || role === "operator"|| role === "officer") {

        document.getElementById("register-account").style.display = "none";
        document.getElementById("links").style.justifyContent = "center";

    }

});

async function login() {

    const loginButton = document.getElementById("loginBtn");
    loginButton.disabled = true;

    const role = sessionStorage.getItem("selectedRole");

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    if (!role) {

        showMessage("Please select a role first.", "red");

        loginButton.disabled = false;

        setTimeout(() => {

            window.location.href = "/select-role";

        }, 1500);

        return;

    }

    try {

        console.log("========== LOGIN ==========");
        console.log("Role:", role);
        console.log("Username:", username);

        const response = await fetch(`${apiBaseUrl}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                role,
                username,
                password
            })

        });

        const data = await response.json();

        console.log("Status:", response.status);
        console.log("Response:", data);

        if (!response.ok) {

            showMessage(
                data.errors ||
                data.error ||
                data.message,
                "red"
            );

            loginButton.disabled = false;
            return;

        }

        // Ensure backend returned both tokens
        if (!data.accessToken || !data.refreshToken) {

            showMessage(
                "Login failed. Authentication tokens were not returned.",
                "red"
            );

            loginButton.disabled = false;
            return;

        }

        showMessage("Login successful!", "green");

        // Store JWTs
        sessionStorage.setItem(
            "accessToken",
            data.accessToken
        );

        sessionStorage.setItem(
            "refreshToken",
            data.refreshToken
        );

        // Role no longer needed after login
        sessionStorage.removeItem("selectedRole");

        setTimeout(() => {

            if (data.role === "patron") {

                window.location.href = "/patron-homepage";

            }
            else if (data.role === "vendor") {

                window.location.href = "/performance-dashboard";

            }
            else if (data.role === "operator") {

                window.location.href = "/operator";

            }
            else if (data.role === "officer") {

                window.location.href = "/nea-officer/home";

            }
            else {

                sessionStorage.clear();

                showMessage(
                    "Unknown user role.",
                    "red"
                );

                loginButton.disabled = false;

            }

        }, 800);
    }
    catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            "red"
        );

        loginButton.disabled = false;

    }

}

document.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        login();
    }

});
