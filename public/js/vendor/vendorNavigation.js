function initialiseVendorNavigation() {

    ensureVendorNotificationStyles();

    const currentPath = window.location.pathname;

    function getMainIcon(main) {
        return main.querySelector(".title-row img") || main.querySelector(".subpoint img");
    }

    function updateArrow(main) {
        const arrow = main.querySelector(".arrow img");
        if (!arrow) return;
        if (main.classList.contains("open")) {
            arrow.src = "/images/orangedown.png";
        } else {
            arrow.src = "/images/down.png";
        }
    }

    document.querySelectorAll(".main").forEach(main => {
        main.classList.remove("active");
        main.classList.remove("open");

        const icon = getMainIcon(main);
        if (icon && icon.dataset.default) {
            icon.src = icon.dataset.default;
        }

        updateArrow(main, currentPath);
    });

    document.querySelectorAll(".subpoint").forEach(button => {
        button.classList.remove("active");
    });

    // Reset all active states
    function resetAllActive() {
        document.querySelectorAll(".main").forEach(main => {
            const hasCurrentSubpage =
                !!main.querySelector(`.subpoint[data-link="${currentPath}"]`);
            const isCurrentPage =
                main.dataset.link === currentPath || hasCurrentSubpage;
            if (isCurrentPage) return;
            main.classList.remove("active");
            main.classList.remove("open");
            const icon = getMainIcon(main);
            if (icon && icon.dataset.default) {
                icon.src = icon.dataset.default;
            }
            updateArrow(main);
        });
    }

    /*Main Navigation*/
    document.querySelectorAll(".main").forEach(main => {

        const icon = getMainIcon(main);
        const submenu = main.querySelector(".submenu");
        const titleRow = main.querySelector(".title-row");

        /* ---------- Highlight current page ---------- */

        if (main.dataset.link === currentPath) {

            main.classList.add("active");
            updateArrow(main, currentPath);

            if (icon && icon.dataset.active) {
                icon.src = icon.dataset.active;
            }

        }

        if (submenu) {

            const currentButton = submenu.querySelector(
                `.subpoint[data-link="${currentPath}"]`
            );

            if (currentButton) {
                currentButton.classList.add("active");

                main.classList.add("active");
                main.classList.add("open");

                if (icon && icon.dataset.active) {
                    icon.src = icon.dataset.active;
                }

                updateArrow(main, currentPath);

            }

        }

        /* ---------- Hover effects ---------- */

        if (icon && icon.dataset.active) {

            main.addEventListener("mouseenter", () => {
                if (
                    !main.classList.contains("active") &&
                    !main.classList.contains("open")
                ) {
                    icon.src = icon.dataset.active;
                }
            });

            main.addEventListener("mouseleave", () => {
                if (
                    !main.classList.contains("active") &&
                    !main.classList.contains("open")
                ) {
                    icon.src = icon.dataset.default;
                }

            });

        }

        /* ---------- Profile dropdown ---------- */
        if (submenu && titleRow) {
            titleRow.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = main.classList.contains("open");
                if (isOpen) {
                    main.classList.remove("open");
                    main.classList.remove("active");
                    if (icon && icon.dataset.default) {
                        icon.src = icon.dataset.default;
                    }
                    updateArrow(main);
                } else {
                    resetAllActive();
                    main.classList.add("open");
                    main.classList.add("active");
                    if (icon && icon.dataset.active) {
                        icon.src = icon.dataset.active;
                    }
                    updateArrow(main);
                }
            });
            return;
        }

        /* ---------- Normal navigation ---------- */

        const link = main.dataset.link;

        if (link) {

            main.addEventListener("click", () => {

                if (main.classList.contains("logout")) {

                    localStorage.removeItem("token");
                    sessionStorage.clear();

                    window.location.href = "/login";
                    return;

                }

                window.location.href = link;

                if (icon && icon.dataset.active) {
                    icon.src = icon.dataset.active;
                }

            });

        }

    });


    //Submenu buttons

    document.querySelectorAll(".subpoint[data-link]").forEach(button => {

        button.addEventListener("click", (e) => {

            e.preventDefault();
            e.stopPropagation();

            // MVC Route
            window.location.href = button.dataset.link;

        });

    });


    /*MOBILE NAVIGATION*/

    // Highlight current page
    document.querySelectorAll(".mobile-nav-item[data-link]").forEach(item => {

        if (item.dataset.link === currentPath) {
            item.classList.add("active");
        }

    });

    // Click navigation
    document.querySelectorAll(".mobile-nav-item[data-link]").forEach(item => {

        item.addEventListener("click", () => {

            document.querySelectorAll(".mobile-nav-item").forEach(nav => {
                nav.classList.remove("active");
            });

            item.classList.add("active");

            window.location.href = item.dataset.link;

        });

    });


    //When vendor clicks outside the navigation container, the navigation dropdown will close

    document.addEventListener("click", () => {
        resetAllActive();
    });

    // Prevent closing when clicking inside the navigation
    const nav = document.querySelector(".navrectangle");

    if (nav) {
        nav.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    loadVendorDecisionNotifications();

    if (!window.vendorDecisionNotificationPoll) {
        window.vendorDecisionNotificationPoll = window.setInterval(
            loadVendorDecisionNotifications,
            4000
        );
    }
}

function ensureVendorNotificationStyles() {
    if (document.querySelector('link[data-vendor-notifications]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/vendor/vendorNotificationPopup.css";
    link.dataset.vendorNotifications = "true";
    document.head.appendChild(link);
}

async function loadVendorDecisionNotifications() {
    try {
        const { apiFetch } = await import("/js/utility/api.js");
        const response = await apiFetch("/api/vendor/notifications", { credentials: "include" });
        if (!response.ok) return;
        const notifications = await response.json();
        const unreadDecision = notifications.find((item) =>
            [
                "cleaning-decision",
                "hygiene-grade",
                "certificate-approved",
                "certificate-rejected"
            ].includes(item.type) && !item.readAt
        );
        if (!unreadDecision) return;
        if (document.querySelector(".vendor-decision-popup")) return;

        const popup = document.createElement("aside");
        const isCertificateDecision = [
            "certificate-approved",
            "certificate-rejected"
        ].includes(unreadDecision.type);
        const popupState = unreadDecision.type === "hygiene-grade"
            ? "grade"
            : unreadDecision.type === "certificate-approved"
                ? "approved"
                : unreadDecision.type === "certificate-rejected"
                    ? "rejected"
                    : (unreadDecision.status === "approved" ? "approved" : "rejected");
        const popupLabel = isCertificateDecision
            ? "NEA certificate review"
            : unreadDecision.type === "hygiene-grade"
                ? "NEA hygiene grade"
                : "NEA cleaning review";
        const popupLink = isCertificateDecision
            ? "/manage-food-handler-cert"
            : unreadDecision.type === "hygiene-grade"
                ? "/stallHygiene"
                : "/cleaningSubmissions";
        const popupLinkLabel = isCertificateDecision
            ? "View certificate status"
            : unreadDecision.type === "hygiene-grade"
                ? "View hygiene grades"
                : "View cleaning submission";
        popup.className = `vendor-decision-popup ${popupState}`;
        popup.setAttribute("role", "alertdialog");
        popup.setAttribute("aria-live", "assertive");
        popup.innerHTML = `
            <button type="button" class="vendor-decision-close" aria-label="Close notification">&times;</button>
            <p class="vendor-decision-label">${popupLabel}</p>
            <h2>${escapeNotificationText(unreadDecision.title)}</h2>
            <p>${escapeNotificationText(unreadDecision.message)}</p>
            ${isCertificateDecision ? `
              <dl>
                <div><dt>Decision</dt><dd>${unreadDecision.type === "certificate-approved" ? "Approved" : "Rejected"}</dd></div>
              </dl>
            ` : `
            <dl>
                <div><dt>Stall</dt><dd>${escapeNotificationText(unreadDecision.stallName)}</dd></div>
                ${unreadDecision.grade ? `<div><dt>New grade</dt><dd>Grade ${escapeNotificationText(unreadDecision.grade)}${unreadDecision.score != null ? ` (${escapeNotificationText(unreadDecision.score)} / 100)` : ""}</dd></div>` : ""}
                ${unreadDecision.previousGrade ? `<div><dt>Previous grade</dt><dd>Grade ${escapeNotificationText(unreadDecision.previousGrade)}</dd></div>` : ""}
                ${unreadDecision.inspectionDate ? `<div><dt>Inspection date</dt><dd>${escapeNotificationText(unreadDecision.inspectionDate)}</dd></div>` : ""}
                <div><dt>Officer ${unreadDecision.type === "hygiene-grade" ? "remarks" : "reason"}</dt><dd>${escapeNotificationText(unreadDecision.reason)}</dd></div>
                ${unreadDecision.dueDate ? `<div><dt>Resubmit by</dt><dd>${escapeNotificationText(unreadDecision.dueDate)}</dd></div>` : ""}
            </dl>`}
            <a href="${popupLink}">${popupLinkLabel}</a>`;
        document.body.appendChild(popup);

        popup.querySelector(".vendor-decision-close").addEventListener("click", async () => {
            popup.remove();
            await apiFetch(`/api/vendor/notifications/${unreadDecision.id}/read`, {
                method: "PATCH",
                credentials: "include"
            });
            loadVendorDecisionNotifications();
        });
    } catch (error) {
        console.error("Unable to load cleaning decision notifications.", error);
    }
}

function escapeNotificationText(value) {
    const element = document.createElement("div");
    element.textContent = value == null ? "" : String(value);
    return element.innerHTML;
}

