import {
    getRentalAgreements,
    getRentalAgreementById,
    createRentalAgreement,
    updateRentalAgreement
} from "./rentalAgreementAPI.js";

import {
    openDetailsModal,
    closeAgreementModal,
    formatDate
} from "./rentalAgreementUI.js";

const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {
    alert("Please log in to continue.");
    window.location.href = "/select-role";
}

let agreementData = [];

const agreementList = document.getElementById("agreementList");
const agreementForm = document.getElementById("agreementForm");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const rentalPriceInput = document.getElementById("rentalPrice");
const tradeTypeInput = document.getElementById("tradeType");
const termConditionInput = document.getElementById("termCondition");

async function loadRentalAgreements() {
    try {
        agreementData = await getRentalAgreements();
        displayAgreements(agreementData);
    } catch (error) {
        console.error("Unable to load rental agreements:", error);
        alert(error.message);
    }
}

function displayAgreements(agreements) {
    agreementList.innerHTML = "";

    if (agreements.length === 0) {
        const emptyCard = document.createElement("div");
        emptyCard.className = "empty-agreement-card";

        emptyCard.innerHTML =
            '<div class="empty-icon">📄</div>' +
            '<h3>No Rental Agreements</h3>' +
            '<p>You currently do not have any rental agreements.<br>' +
            'Select the + button above to get started.</p>';

        agreementList.appendChild(emptyCard);
        return;
    }

    agreements.forEach(function (agreement) {
        const card = document.createElement("div");

        card.className =
            "agreement-card shade-" +
            (agreement.aid % 4);

        const infoButton =
            '<button type="button" class="info-btn" ' +
            'data-id="' + agreement.aid + '" ' +
            'aria-label="View rental agreement">' +
            '<img src="../images/info.png" alt="View">' +
            '</button>';

        let actionButtons = "";

        if (agreement.agr_status === "expired") {
            actionButtons =
                '<button type="button" class="edit-btn disabled-edit-btn" ' +
                'data-id="' + agreement.aid + '" ' +
                'aria-label="Edit rental agreement" ' +
                'title="Expired agreements cannot be edited">' +
                '<img src="../images/edit.png" alt="Edit">' +
                '</button>' +
                '<button type="button" class="renew-btn" ' +
                'data-id="' + agreement.aid + '" ' +
                'aria-label="Renew rental agreement">' +
                '<img src="../images/edit.png" alt="Renew">' +
                '</button>';
        } else {
            actionButtons =
                '<button type="button" class="edit-btn" ' +
                'data-id="' + agreement.aid + '" ' +
                'aria-label="Edit rental agreement">' +
                '<img src="../images/edit.png" alt="Edit">' +
                '</button>';
        }

        card.innerHTML =
            '<span>' +
            '<strong class="mobile-label">AID:</strong>' +
            agreement.aid +
            '</span>' +

            '<span>' +
            '<strong class="mobile-label">Start Date:</strong>' +
            formatDate(agreement.agr_start_date) +
            '</span>' +

            '<span>' +
            '<strong class="mobile-label">End Date:</strong>' +
            formatDate(agreement.agr_end_date) +
            '</span>' +

            '<span>' +
            '<strong class="mobile-label">Validity Period:</strong>' +
            agreement.validity_period +
            ' days</span>' +

            '<span>' +
            '<strong class="mobile-label">Status:</strong>' +
            '<span class="status ' +
            agreement.agr_status +
            '">' +
            agreement.agr_status +
            '</span>' +
            '</span>' +

            '<span class="controls">' +
            infoButton +
            actionButtons +
            '</span>';

        agreementList.appendChild(card);
    });
}

async function viewRentalAgreement(id) {
    try {
        const agreement = await getRentalAgreementById(id);
        openDetailsModal(agreement);
    } catch (error) {
        console.error(
            "Unable to load rental agreement:",
            error
        );

        alert(error.message);
    }
}

agreementList.addEventListener("click", function (event) {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const id = button.dataset.id;

    if (button.classList.contains("info-btn")) {
        viewRentalAgreement(id);
        return;
    }

    if (button.classList.contains("edit-btn")) {
        editRentalAgreement(id);
        return;
    }

    if (button.classList.contains("renew-btn")) {
        renewRentalAgreement(id);
        return;
    }
});

async function editRentalAgreement(id) {
    const agreement = agreementData.find(function (item) {
        return item.aid == id;
    });

    if (!agreement) {
        console.error("Agreement not found:", id);
        return;
    }

    if (agreement.agr_status === "expired") {
        alert(
            "Expired rental agreements cannot be edited. Please renew the agreement instead."
        );
        return;
    }

    const tradeType = prompt(
        "Enter trade type (cooked food or uncooked food):",
        agreement.trade_type
    );

    if (!tradeType) {
        return;
    }

    const formattedTradeType =
        tradeType.trim().toLowerCase();

    if (
        formattedTradeType !== "cooked food" &&
        formattedTradeType !== "uncooked food"
    ) {
        alert(
            "Please enter either cooked food or uncooked food."
        );
        return;
    }

    if (formattedTradeType === agreement.trade_type) {
        alert("No changes were made.");
        return;
    }

    try {
        const updatedAgreement =
            await updateRentalAgreement(
                id,
                formattedTradeType
            );

        const index =
            agreementData.findIndex(function (item) {
                return item.aid == id;
            });

        if (index !== -1) {
            agreementData[index] = {
                ...agreementData[index],
                ...updatedAgreement,
                trade_type: formattedTradeType
            };
        }

        displayAgreements(agreementData);

        alert(
            "Rental agreement updated successfully."
        );
    } catch (error) {
        console.error(
            "Unable to update rental agreement:",
            error
        );

        alert(error.message);
    }
}

async function renewRentalAgreement(id) {
    const agreement = agreementData.find(function (item) {
        return item.aid == id;
    });

    if (!agreement) {
        console.error("Agreement not found:", id);
        return;
    }

    if (agreement.agr_status !== "expired") {
        alert(
            "Only expired rental agreements can be renewed."
        );
        return;
    }

    const startDate = prompt(
        "Enter renewal start date (YYYY-MM-DD):"
    );

    if (!startDate) {
        return;
    }

    const endDate = prompt(
        "Enter renewal end date (YYYY-MM-DD):"
    );

    if (!endDate) {
        return;
    }

    if (!isValidDateRange(startDate, endDate)) {
        alert(
            "End date must be after start date."
        );
        return;
    }

    try {
        await createRentalAgreement(
            agreement.aid,
            startDate,
            endDate
        );

        alert(
            "Rental agreement renewed successfully."
        );

        await loadRentalAgreements();
    } catch (error) {
        console.error(
            "Unable to renew rental agreement:",
            error
        );

        alert(error.message);
    }
}

if (agreementForm) {
    agreementForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const startDate =
                startDateInput.value;

            const endDate =
                endDateInput.value;

            const rentalPrice =
                rentalPriceInput.value;

            const tradeType =
                tradeTypeInput.value;

            const termCondition =
                termConditionInput.value.trim();

            if (
                !startDate ||
                !endDate ||
                !rentalPrice ||
                !tradeType ||
                !termCondition
            ) {
                alert(
                    "Please fill in all required fields."
                );
                return;
            }

            if (
                !isValidDateRange(
                    startDate,
                    endDate
                )
            ) {
                alert(
                    "End date must be after start date."
                );
                return;
            }

            try {
                const response =
                    await createRentalAgreement(
                        null,
                        startDate,
                        endDate,
                        rentalPrice,
                        tradeType,
                        termCondition
                    );

                alert(
                    "Rental agreement created successfully."
                );

                agreementForm.reset();

                closeAgreementModal();

                await loadRentalAgreements();
            } catch (error) {
                console.error(
                    "Unable to create rental agreement:",
                    error
                );

                alert(error.message);
            }
        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    function () {
        const statusFilter =
            document.getElementById(
                "statusFilter"
            );

        if (statusFilter) {
            statusFilter.addEventListener(
                "change",
                function () {
                    const value =
                        statusFilter.value;

                    if (value === "all") {
                        displayAgreements(
                            agreementData
                        );
                    } else {
                        displayAgreements(
                            agreementData.filter(
                                function (agreement) {
                                    return (
                                        agreement.agr_status ===
                                        value
                                    );
                                }
                            )
                        );
                    }
                }
            );
        }

        loadRentalAgreements();
    }
);

function isValidDateRange(
    startDate,
    endDate
) {
    return (
        new Date(endDate) >
        new Date(startDate)
    );
}