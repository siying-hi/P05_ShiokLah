function showMessage(message, color) {
    const messageBox = document.getElementById("message");

    // If message is an array (e.g. Joi validation errors), join them nicely
    if (Array.isArray(message)) {
        messageBox.innerHTML = message.map(err => `<div>${err}</div>`).join("");
    } else {
        messageBox.textContent = message;
    }

    messageBox.style.color = color;
}

document.getElementById("registerBtn").addEventListener("click", register);

const apiBaseUrl = "http://localhost:3000";

async function register() {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const role = sessionStorage.getItem("selectedRole");

    // Basic client-side checks
    if (!role) {
        showMessage("Please select a role first.", "red");
        setTimeout(() => window.location.href = "select-role.html", 1500);
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "red");
        return;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, firstName, lastName, username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            // Middleware might send { error: "..."} or { errors: ["...", "..."] }
            const errorMsg = data.error || data.message || data.errors || "Registration failed.";
            showMessage(errorMsg, "red");
            return;
        }

        showMessage(data.message || "Registration successful!", "green");

        setTimeout(() => {
            window.location.href = "/login";
        }, 1500);

    } catch (error) {
        console.error(error);
        showMessage("Unable to connect to the server.", "red");
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        register();
    }
});
