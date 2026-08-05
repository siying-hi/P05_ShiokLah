document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("vendor-navigation");
    if (!container) return;
    try {
        const response = await fetch("/vendor/vendorNavigation.html");
        if (!response.ok) {
            throw new Error("Failed to load navigation.");
        }
        container.innerHTML = await response.text();
        initialiseVendorNavigation();
        const logoutButtons = document.querySelectorAll(".logout-button");
        logoutButtons.forEach(button => {
            button.addEventListener("click", async (event) => {
                event.preventDefault();
                const accessToken = sessionStorage.getItem("accessToken");
                try {
                    await fetch("http://localhost:3000/logout", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    });
                } catch (error) {
                    console.error("Logout error:", error);
                }
                sessionStorage.clear();
                window.location.href = "/select-role";
            });
        });
    } catch (err) {
        console.error(err);
    }
});