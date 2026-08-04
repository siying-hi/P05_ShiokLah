document.addEventListener("DOMContentLoaded", async () => {
    const navigation = document.getElementById("operator-navigation");

    if (!navigation) return;

    try {
        const response = await fetch("/operator/operatorNavigation.html");
        const html = await response.text();

        navigation.innerHTML = html;

        // Highlight current page
        const currentPath = window.location.pathname.replace(/\/+$/, "");

        document.querySelectorAll(".nav-links a, .side-menu a").forEach(link => {
            const href = new URL(link.href).pathname.replace(/\/+$/, "");

            if (href === currentPath) {
                link.classList.add("active");
            }
        });

        // Hamburger menu
        const hamburger = document.getElementById("hamburger");
        const sideNav = document.getElementById("sideNav");
        const overlay = document.querySelector(".nav-overlay");

        if (hamburger && sideNav && overlay) {
            hamburger.addEventListener("click", () => {
                sideNav.classList.toggle("show");
                overlay.classList.toggle("show");
            });

            overlay.addEventListener("click", () => {
                sideNav.classList.remove("show");
                overlay.classList.remove("show");
            });
        }

    } catch (error) {
        console.error("Failed to load navigation:", error);
    }
});