function goLogin(role) {
    sessionStorage.setItem("selectedRole", role);
    window.location.href = "/login";
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".roleBtn").forEach((button) => {
        button.addEventListener("click", () => {
            goLogin(button.dataset.role);
        });
    });
});