import {
    openModal,
    closeModal,
    setFormModeAdd,
    setFormModeEdit,
    isEditMode,
    getEditingCertificateId,
    showValidationErrors
} from "./foodCertUI.js";

import {
    getFoodCertificates,
    createCertificate,
    updateCertificate,
    deleteCertificate
} from "./foodCertAPI.js";

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");
const displayedCertificateNotificationIds = new Set();
let certificateNotificationPoll;

if (!accessToken) {
    window.location.href = "/select-role";
}

document.addEventListener("DOMContentLoaded", async () => {

    await Promise.all([
        loadCertificates(),
        loadCertificateNotifications()
    ]);

    document.getElementById("foodCertForm")
        .addEventListener("submit", handleCertificateSubmit);

    certificateNotificationPoll = window.setInterval(
        loadCertificateNotifications,
        4000
    );

});

//Lalitha's Notification
async function loadCertificateNotifications() {
    try {
        // Added: retrieve the vendor's latest NEA certificate decisions.
        const response = await fetch("/api/vendor/certificate-notifications", { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!response.ok) return;
        const notifications = await response.json();
        let panel = document.querySelector(".certificate-notifications");
        const wasExpanded = panel?.classList.contains("expanded") || false;
        if (!panel) {
            panel = document.createElement("section");
            document.querySelector(".page-header")
                .insertAdjacentElement("afterend", panel);
        }
        panel.className = "certificate-notifications";
        if (wasExpanded) panel.classList.add("expanded");
        // Added: keep this bar focused on certificate approvals and rejections.
        const certificateNotifications = notifications.filter(item =>
            ["certificate-approved", "certificate-rejected"].includes(item.type)
        );
        panel.innerHTML = `
            <div class="certificate-notification-bar">
                <div>
                    <strong>Certificate Notifications</strong>
                    <span>${certificateNotifications.length}</span>
                </div>
                <button type="button" class="certificate-notification-toggle">
                    ${wasExpanded ? "Hide notifications" : "Open notifications"}
                </button>
            </div>
            <div class="certificate-notification-list">
                ${certificateNotifications.length
                    ? certificateNotifications.map((item) => `
                        <article class="certificate-notification ${item.type === "certificate-rejected" ? "rejected" : "approved"}">
                            <strong>${escapeNotificationText(item.title)}</strong>
                            <p>${escapeNotificationText(item.message)}</p>
                            <small>${new Date(item.createdAt).toLocaleString()}</small>
                        </article>
                    `).join("")
                    : `<p class="certificate-notification-empty">No certificate notifications yet.</p>`
                }
            </div>`;

        // Added: expand or collapse the compact notification bar.
        panel.querySelector(".certificate-notification-toggle")
            .addEventListener("click", () => {
                const expanded = panel.classList.toggle("expanded");
                panel.querySelector(".certificate-notification-toggle")
                    .textContent = expanded
                        ? "Hide notifications"
                        : "Open notifications";
            });

        // Added: show unread approval/rejection decisions as popup notifications.
        notifications
            .filter(item =>
                !item.readAt &&
                ["certificate-approved", "certificate-rejected"].includes(item.type) &&
                !displayedCertificateNotificationIds.has(item.id)
            )
            .forEach(showCertificateNotificationPopup);
    } catch (error) {
        console.error("Unable to load certificate notifications.", error);
    }
}

function escapeNotificationText(value) {
    const element = document.createElement("span");
    element.textContent = value || "";
    return element.innerHTML;
}

// Loading certificates
async function loadCertificates() {
    try {
        const certificates = await getFoodCertificates();
        renderCertificates(certificates);
    }
    catch (error) {
        console.error(error);
    }
}

// Si Ying Certificate Rendering
function renderCertificates(certificates) {
    const list = document.getElementById("certificateList");
    list.innerHTML = "";
    // Added: calculate status totals when an optional summary is present.
    const pendingCount = certificates.filter(
        cert => cert.approval_status === "Pending"
    ).length;
    const approvedCount = certificates.filter(
        cert => cert.approval_status === "Approved"
    ).length;
    const pendingCountElement = document.getElementById(
        "vendorPendingCertificateCount"
    );
    const approvedCountElement = document.getElementById(
        "vendorApprovedCertificateCount"
    );
    if (pendingCountElement) pendingCountElement.textContent = pendingCount;
    if (approvedCountElement) approvedCountElement.textContent = approvedCount;

    const approvedDetailsElement = document.getElementById(
        "approvedCertificateDetails"
    );
    if (approvedDetailsElement) renderApprovedCertificateDetails(certificates);
    certificates.forEach(cert => {
        const canEdit = cert.approval_status === "Pending";
        const card = document.createElement("div");
        card.className = "certificate-card";
        card.innerHTML = `
            <div class="mobile-label">Certificate</div>
            <div class="certificate-name">${cert.certificate_name}</div>
            <div class="mobile-label">Issue Date</div>
            <div class="issue-date">${cert.issue_date.substring(0, 10)}</div>
            <div class="mobile-label">Expiry Date</div>
            <div class="expiry-date">${cert.expiry_date.substring(0, 10)}</div>
            <div class="mobile-label">Validity</div>
            <div class="validity">${cert.validity_period} Days</div>
            <div class="mobile-label">Status</div>
            <div class="status">${cert.approval_status}</div>
            <div class="actions">
                ${cert.certificate_image_path
                    ? `
                    <!-- Added: open the picture submitted with this certificate. -->
                    <a class="icon-btn certificate-picture-btn"
                       href="${escapeNotificationText(cert.certificate_image_path)}"
                       target="_blank"
                       rel="noopener"
                       title="View certificate picture"
                       aria-label="View certificate picture">View</a>
                    `
                    : ""
                }
                ${canEdit
                    ? `
                    <button class="icon-btn edit-btn" data-id="${cert.certificate_id}">
                        <img src="../images/edit.png">
                    </button>
                    <button class="icon-btn delete-btn" data-id="${cert.certificate_id}">
                        <img src="../images/delete.png">
                    </button>
                    `
                    : `
                    <button class="icon-btn disabled-btn" disabled>
                        <img src="../images/edit.png">
                    </button>
                    <button class="icon-btn delete-btn disabled-btn" disabled>
                        <img src="../images/delete.png">
                    </button>
                    `
                }
            </div>
        `;
        list.appendChild(card);
        card.querySelector(".delete-btn").addEventListener("click", async () => {
            const confirmed = confirm("Delete this certificate?");
            if (!confirmed) return;
            try {
                const result = await deleteCertificate(cert.certificate_id);
                alert(result.message);
                await loadCertificates();
            } catch (error) {
                alert(error.message);
            }
        });
    });
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const cert = certificates.find(
                c => c.certificate_id == id
            );
            setFormModeEdit(cert);
            openModal();
        });
    });
}

async function handleCertificateSubmit(e) {

    e.preventDefault();

    const submitStatus = document.getElementById("certificateSubmitStatus");
    submitStatus.classList.remove("success");
    submitStatus.textContent = "";

    const pictureInput = document.getElementById("certificatePicture");
    const pictureFile = pictureInput.files[0];

    if (!isEditMode() && !pictureFile) {
        document.getElementById("certificatePictureError").textContent =
            "Certificate picture is required.";
        submitStatus.textContent = "Please add a certificate picture before confirming.";
        return;
    }

    if (pictureFile && pictureFile.size > 8 * 1024 * 1024) {
        document.getElementById("certificatePictureError").textContent =
            "Certificate picture must be 8 MB or smaller.";
        submitStatus.textContent = "The selected picture is too large.";
        return;
    }

    const data = {

        certificate_name:
            document.getElementById("certificateName").value,

        issue_date:
            document.getElementById("issueDate").value,

        expiry_date:
            document.getElementById("expiryDate").value,

        issuing_authority:
            document.getElementById("issuingAuthority").value

    };

    if (pictureFile) {
        data.certificate_image = await fileToDataUrl(pictureFile);
        data.certificate_image_name = pictureFile.name;
    }

    try {

        submitStatus.textContent = "Submitting certificate for NEA review...";

        if (isEditMode()) {

            const result = await updateCertificate(
                getEditingCertificateId(),
                data
            );

            alert(result.message ||
                "Certificate updated successfully.");
            submitStatus.classList.add("success");
            submitStatus.textContent = result.message ||
                "Certificate updated successfully.";

        }

        else {

            const result = await createCertificate(data);

            alert(result.message ||
                "Certificate added successfully.");
            submitStatus.classList.add("success");
            submitStatus.textContent = result.message ||
                "Certificate submitted successfully.";

        }


        closeModal();

        await loadCertificates();


    }
    catch (error) {

        console.error(error);


        // Joi validation errors
        if (Array.isArray(error.error)) {

            showValidationErrors(error.error);
            submitStatus.textContent = error.error.join(" ");

        }

        else {

            submitStatus.textContent =
                error.message || error.error || "Certificate submission failed.";
            alert(submitStatus.textContent);

        }

    }

}

function showCertificateNotificationPopup(notification) {
    displayedCertificateNotificationIds.add(notification.id);

    const toastContainer = document.getElementById(
        "certificateNotificationToasts"
    );
    const toast = document.createElement("article");
    const notificationClass = notification.type === "certificate-approved"
        ? "approved"
        : "rejected";

    toast.className = `certificate-toast ${notificationClass}`;
    toast.innerHTML = `
        <button class="certificate-toast-close" type="button" aria-label="Close notification">&times;</button>
        <strong>${escapeNotificationText(notification.title)}</strong>
        <p>${escapeNotificationText(notification.message)}</p>
        <small>${new Date(notification.createdAt).toLocaleString()}</small>
    `;
    toastContainer.appendChild(toast);

    const removeToast = () => toast.remove();
    toast.querySelector(".certificate-toast-close")
        .addEventListener("click", removeToast);
    window.setTimeout(removeToast, 8000);

    fetch(`/api/vendor/notifications/${notification.id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` }
    }).catch(error => {
        console.error("Unable to mark certificate notification as read.", error);
    });
}

function renderApprovedCertificateDetails(certificates) {
    const approvedList = document.getElementById("approvedCertificateDetails");
    const approvedCertificates = certificates.filter(
        cert => cert.approval_status === "Approved"
    );

    if (!approvedCertificates.length) {
        approvedList.innerHTML =
            `<p class="approved-certificate-empty">No approved certificates yet.</p>`;
        return;
    }

    approvedList.innerHTML = approvedCertificates.map(cert => `
        <article class="approved-certificate-item">
            <div>
                <h3>${escapeNotificationText(cert.certificate_name)}</h3>
                <p>Issued by ${escapeNotificationText(cert.issuing_authority)}</p>
            </div>
            <div>
                <small>Issue date</small>
                <p>${escapeNotificationText(cert.issue_date.substring(0, 10))}</p>
            </div>
            <div>
                <small>Expiry date</small>
                <p>${escapeNotificationText(cert.expiry_date.substring(0, 10))}</p>
            </div>
            ${cert.certificate_image_path
                ? `<a href="${escapeNotificationText(cert.certificate_image_path)}" target="_blank" rel="noopener">View approved picture</a>`
                : `<span>Picture unavailable</span>`}
        </article>
    `).join("");
}

function fileToDataUrl(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = () => reject(
            new Error("Unable to read the certificate picture.")
        );

        reader.readAsDataURL(file);

    });

}
