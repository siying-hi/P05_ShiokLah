import { apiFetch } from "../utility/api.js";


const API_URL = "/operator/api/rentalAgreements";


// Get all rental agreements
export async function getAllRentalAgreements() {

    const response = await apiFetch(
        `${API_URL}/all`,
        {
            method: "GET"
        }
    );


    if (!response.ok) {

        throw new Error(
            "Failed to retrieve rental agreements."
        );

    }


    return await response.json();

}




// Update rental agreement status
export async function updateRentalStatus(
    agreementId,
    status
) {

    const response = await apiFetch(
        `${API_URL}/${agreementId}/status`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                status: status
            })
        }
    );


    if (!response.ok) {

        throw new Error(
            "Failed to update rental agreement status."
        );

    }


    return await response.json();

}