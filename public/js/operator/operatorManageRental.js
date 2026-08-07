import {
    getAllRentalAgreements,
    updateRentalStatus
} from "./raAPI.js";


const tableBody =
    document.getElementById("agreementTableBody");



async function loadAgreements() {

    const agreements =
        await getAllRentalAgreements();


    renderAgreements(agreements);

}





function renderAgreements(agreements) {


    tableBody.innerHTML = "";


    agreements.forEach(agreement => {


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${agreement.stall_name}
            </td>


            <td>
                ${agreement.location}
            </td>


            <td>
                ${new Date(
            agreement.agr_start_date
        ).toLocaleDateString()}
            </td>


            <td>
                ${agreement.validity_period} days
            </td>


            <td>
                ${agreement.terms_conditions}
            </td>


            <td>
                <span class="status ${agreement.status}">
                    ${agreement.status}
                </span>
            </td>


            <td>

                ${agreement.status === "inactive"

                ?

                `

                    <button
                        class="approve-btn"
                        data-id="${agreement.agreement_id}"
                    >
                        Approve
                    </button>


                    <button
                        class="reject-btn"
                        data-id="${agreement.agreement_id}"
                    >
                        Reject
                    </button>

                    `

                :

                "-"

            }

            </td>

        `;


        tableBody.appendChild(row);


    });


}





tableBody.addEventListener(
    "click",
    async (e) => {


        const id =
            e.target.dataset.id;


        if (
            e.target.classList.contains(
                "approve-btn"
            )
        ) {

            await updateRentalStatus(
                id,
                "Active"
            );

            loadAgreements();

        }



        if (
            e.target.classList.contains(
                "reject-btn"
            )
        ) {

            await updateRentalStatus(
                id,
                "Rejected"
            );


            loadAgreements();

        }


    }
);


loadAgreements();
document.addEventListener("DOMContentLoaded", () => {

    const pageTitle = document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent = "Manage Rental Agreement";
    }

});