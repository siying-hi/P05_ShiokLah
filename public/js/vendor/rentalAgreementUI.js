const addBtn = document.getElementById("addBtn");
const agreementModal = document.getElementById("agreementModal");
const agreementOverlay = document.getElementById("agreementOverlay");
const cancelModal = document.getElementById("cancelModal");
const detailsModal = document.getElementById("detailsModal");
const closeDetails = document.getElementById("closeDetails");

if (addBtn && agreementModal) {
    addBtn.addEventListener("click", () => {
        agreementModal.style.display = "flex";
    });
}

export function closeAgreementModal() {
    if (agreementModal) {
        agreementModal.style.display = "none";
    }
}

if (cancelModal) {
    cancelModal.addEventListener("click", closeAgreementModal);
}

if (agreementOverlay) {
    agreementOverlay.addEventListener("click", closeAgreementModal);
}

export function openDetailsModal(data) {
    if (!detailsModal) {
        return;
    }


    const agreementDetails = document.getElementById("agreementDetails");

    if (!agreementDetails) {
        return;
    }

    detailsModal.style.display = "flex";

    agreementDetails.innerHTML = `
        < div class="detail-row" >
        <b>AID</b>
        <span>${String(data.aid)}</span>
    </div >
    <div class="detail-row">
        <b>Stall Location</b>
        <span>${data.stall_location}</span>
    </div>
    <div class="detail-row">
        <b>Status</b>
        <span>${data.agr_status}</span>
    </div>
    <div class="detail-row">
        <b>Start Date</b>
        <span>${formatDate(data.agr_start_date)}</span>
    </div>
    <div class="detail-row">
        <b>End Date</b>
        <span>${formatDate(data.agr_end_date)}</span>
    </div>
    <div class="detail-row">
        <b>Validity Period</b>
        <span>${data.validity_period} days</span>
    </div>
    <div class="detail-row">
        <b>Rental Price</b>
        <span>£${Number(data.rental_price).toFixed(2)}</span>
    </div>
    <div class="detail-row">
        <b>Trade Type</b>
        <span>${data.trade_type}</span>
    </div>
    <div class="detail-row">
        <b>Operator ID</b>
        <span>${data.officer_id}</span>
    </div>
    <div class="detail-row">
        <b>Terms</b>
        <span>${data.agr_term_condition}</span>
    </div>
    `;
}

if (closeDetails && detailsModal) {
    closeDetails.addEventListener("click", () => {
        detailsModal.style.display = "none";
    });
}

export function formatDate(date) {
    if (!date) {
        return "-";
    }


    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });


}
