import {
    getRentalAgreements,
    getRentalAgreementById,
    renewRentalAgreement,
    updateRentalAgreement
} from "./rentalAgreementAPI.js";

import {
    openDetailsModal,
    formatDate,
    closeAgreementModal
} from "./rentalAgreementUI.js";

const accessToken =
    sessionStorage.getItem("accessToken");

if (!accessToken) {
    alert("Please log in to continue.");
    window.location.href = "/select-role";
}

let agreementData = [];

const agreementList =
    document.getElementById("agreementList");

const addBtn =
    document.getElementById("addBtn");

const agreementModal =
    document.getElementById("agreementModal");

const agreementForm =
    document.getElementById("agreementForm");

const startDateInput =
    document.getElementById("startDate");

const endDateInput =
    document.getElementById("endDate");

const rentalPriceInput =
    document.getElementById("rentalPrice");

const tradeTypeInput =
    document.getElementById("tradeType");

const termConditionInput =
    document.getElementById("termCondition");

const formTitle =
    document.getElementById("formTitle");



// =============================
// LOAD AGREEMENTS
// =============================

async function loadRentalAgreements() {

    try {

        agreementData =
            await getRentalAgreements();

        displayAgreements(
            agreementData
        );

    } catch(error) {

        console.error(
            "Unable to load rental agreements:",
            error
        );

        alert(
            error.message
        );

    }

}



// =============================
// DISPLAY AGREEMENTS
// =============================

function displayAgreements(
    agreements
) {

    agreementList.innerHTML = "";

    if (
        agreements.length === 0
    ) {

        agreementList.innerHTML = `

            <div class="empty-agreement-card">

                <div class="empty-icon">
                    📄
                </div>

                <h3>
                    No Rental Agreements
                </h3>

                <p>
                    You currently do not have any rental agreements.
                </p>

            </div>

        `;

        return;

    }

    agreements.forEach(
        agreement => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "agreement-card shade-" +
                (agreement.aid % 4);


            let actionButton = "";


            if (
                agreement.agr_status === "pending"
            ) {

                actionButton = `

                    <button
                        class="edit-btn"
                        data-id="${agreement.aid}">

                        <img
                        src="../images/edit.png"
                        alt="Edit">

                    </button>

                `;

            }


            card.innerHTML = `

                <span>

                    <strong class="field-label">
                        AID:
                    </strong>

                    ${agreement.aid}

                </span>

                <span>

                    <strong class="field-label">
                        Start Date:
                    </strong>

                    ${formatDate(
                        agreement.agr_start_date
                    )}

                </span>

                <span>

                    <strong class="field-label">
                        End Date:
                    </strong>

                    ${formatDate(
                        agreement.agr_end_date
                    )}

                </span>

                <span>

                    <strong class="field-label">
                        Validity:
                    </strong>

                    ${agreement.validity_period}
                    days

                </span>

                <span>

                    <strong class="field-label">
                        Status:
                    </strong>

                    <span class="status ${agreement.agr_status}">

                        ${agreement.agr_status}

                    </span>

                </span>

                <span class="controls">

                    <button
                        class="info-btn"
                        data-id="${agreement.aid}">

                        <img 
                        src="../images/info.png"
                        alt="View">

                    </button>
                    ${actionButton}

                </span>

            `;

            agreementList.appendChild(
                card
            );

        }
    );

}



// =============================
// VIEW DETAILS
// =============================

async function viewRentalAgreement(id) {

    try {

        const agreement =
            await getRentalAgreementById(id);

        openDetailsModal(
            agreement
        );

    } catch(error) {

        console.error(
            "Unable to load agreement:",
            error
        );

        alert(
            error.message
        );

    }

}



// =============================
// OPEN RENEW FORM FROM ADD BUTTON
// =============================

addBtn.addEventListener(
    "click",
    async function() {

        const activeAgreement =
            agreementData.find(
                agreement =>
                agreement.agr_status === "active"
            );


        if(activeAgreement) {

            alert(
                "You already have an ongoing rental agreement."
            );

            return;

        }


        const latestExpired =
            agreementData
            .filter(
                agreement =>
                agreement.agr_status === "expired"
            )
            .sort(
                (a,b) =>
                new Date(b.agr_end_date) -
                new Date(a.agr_end_date)
            )[0];


        if(!latestExpired) {

            alert(
                "No expired rental agreement found."
            );

            return;

        }


        agreementModal.style.display =
            "flex";


        formTitle.textContent =
            "Renew Rental Agreement";


        rentalPriceInput.value =
            latestExpired.rental_price;


        rentalPriceInput.disabled =
            true;


        tradeTypeInput.value =
            latestExpired.trade_type;


        termConditionInput.value =
            latestExpired.agr_term_condition;


        agreementForm.dataset.previousAid =
            latestExpired.aid;

    }
);

// =============================
// EDIT AGREEMENT
// =============================

async function editRentalAgreement(id) {

    const agreement =
        agreementData.find(
            item =>
            item.aid == id
        );


    if(!agreement) {

        return;

    }


    if(
        agreement.agr_status !== "pending"
    ) {

        alert(
            "Only pending agreements can be edited."
        );

        return;

    }


    const tradeType =
        prompt(
            "Enter new trade type:",
            agreement.trade_type
        );


    if(!tradeType) {

        return;

    }


    try {

        await updateRentalAgreement(
            id,
            tradeType
        );


        alert(
            "Rental agreement updated successfully."
        );


        await loadRentalAgreements();


    } catch(error) {

        console.error(
            "Update failed:",
            error
        );


        alert(
            error.message
        );

    }

}



// =============================
// FORM SUBMISSION
// =============================

if(agreementForm) {

    agreementForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const previousAid =
                agreementForm.dataset.previousAid;


            const startDate =
                startDateInput.value;


            const endDate =
                endDateInput.value;


            const tradeType =
                tradeTypeInput.value;


            const termCondition =
                termConditionInput.value.trim();



            if(
                !startDate ||
                !endDate ||
                !tradeType ||
                !termCondition
            ) {

                alert(
                    "Please fill in all required fields."
                );

                return;

            }



            if(
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

                await renewRentalAgreement(
                    previousAid,
                    {
                        startDate,
                        endDate,
                        tradeType,
                        termCondition
                    }
                );


                alert(
                    "Rental agreement renewal submitted for operator audit."
                );


                agreementForm.reset();


                rentalPriceInput.disabled =
                    false;


                delete agreementForm.dataset.previousAid;


                closeAgreementModal();


                await loadRentalAgreements();


            } catch(error) {

                console.error(
                    "Renew failed:",
                    error
                );


                alert(
                    error.message
                );

            }

        }
    );

}



// =============================
// BUTTON EVENTS
// =============================

agreementList.addEventListener(
    "click",
    function(event) {


        const button =
            event.target.closest(
                "button"
            );


        if(!button) {

            return;

        }


        const id =
            button.dataset.id;



        if(
            button.classList.contains(
                "info-btn"
            )
        ) {

            viewRentalAgreement(id);

        }



        if(
            button.classList.contains(
                "edit-btn"
            )
        ) {

            editRentalAgreement(id);

        }


    }
);



// =============================
// STATUS FILTER
// =============================

document.addEventListener(
    "DOMContentLoaded",
    function() {


        const statusFilter =
            document.getElementById(
                "statusFilter"
            );



        if(statusFilter) {

            statusFilter.addEventListener(
                "change",
                function() {


                    const value =
                        statusFilter.value;



                    if(
                        value === "all"
                    ) {

                        displayAgreements(
                            agreementData
                        );


                    } else {


                        displayAgreements(

                            agreementData.filter(
                                agreement =>
                                agreement.agr_status === value
                            )

                        );

                    }

                }
            );

        }



        loadRentalAgreements();


    }
);



// =============================
// DATE VALIDATION
// =============================

function isValidDateRange(
    startDate,
    endDate
) {

    return (
        new Date(endDate) >
        new Date(startDate)
    );

}

// =============================
// BUTTON EVENTS
// =============================

agreementList.addEventListener(
    "click",
    async function(event) {


        const button =
            event.target.closest("button");


        if (!button) {

            return;

        }



        const id =
            button.dataset.id;



        // INFO BUTTON
        if (
            button.classList.contains(
                "info-btn"
            )
        ) {


            try {


                const agreement =
                    await getRentalAgreementById(id);



                if (!agreement) {

                    alert(
                        "Rental agreement not found."
                    );

                    return;

                }



                openDetailsModal(
                    agreement
                );


            }
            catch(error) {


                console.error(
                    "Unable to load agreement details:",
                    error
                );


                alert(
                    error.message
                );


            }


            return;

        }



        // EDIT BUTTON
        if (
            button.classList.contains(
                "edit-btn"
            )
        ) {


            editRentalAgreement(id);


            return;

        }


    }
);