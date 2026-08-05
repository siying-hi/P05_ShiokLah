import { getVendorProfile } from "./vendorProfileAPI.js";

const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {
    alert("Please log in to continue.");
    window.location.href = "/select-role";
}

async function loadVendorProfile() {
    try {
        const vendor = await getVendorProfile();

        document.getElementById("vendorName").textContent =
            `${vendor.first_name} ${vendor.last_name}`;

        document.getElementById("vendorEmail").textContent =
            vendor.email;

        document.getElementById("vendorFirstName").textContent =
            vendor.first_name;

        document.getElementById("vendorLastName").textContent =
            vendor.last_name;

        document.getElementById("vendorEmailInfo").textContent =
            vendor.email;

        document.getElementById("vendorContact").textContent =
            vendor.contact_number || "Not available";

        document.getElementById("stallName").textContent =
            vendor.stall_name || "No stall assigned";

        document.getElementById("hawkerCentre").textContent =
            "Boon Lay Hawker Centre";

    } catch (err) {
        console.error("Unable to load vendor profile:", err);
    }
}

loadVendorProfile();

document.querySelectorAll(".profile-tab")
    .forEach(tab => {
        tab.addEventListener("click", () => {
            const link = tab.dataset.link;

            if (link) {
                window.location.href = link;
            }
        });
    });