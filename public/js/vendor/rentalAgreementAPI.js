import { apiFetch } from "../utility/api.js";


async function handleResponse(response) {

    const data = await response.json();


    if (!response.ok) {

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(data.message);

            sessionStorage.clear();

            window.location.href =
                "/select-role";

            return;

        }


        throw new Error(
            Array.isArray(data.error)
                ? data.error.join("\n")
                : data.error || data.message
        );

    }


    return data;

}



export async function getRentalAgreements() {

    const response =
        await apiFetch(
            "/api/rentalAgreement"
        );


    const data =
        await handleResponse(response);


    return data;

}

export async function getRentalAgreementById(id) {

    const response =
        await apiFetch(
            `/api/rentalAgreement/${id}`
        );


    const data =
        await handleResponse(response);


    return data;

}

export async function renewRentalAgreement(data) {

    const response =
        await apiFetch(
            "/api/rentalAgreement/renew",
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)

            }

        );


    return await handleResponse(response);

}

export async function updateRentalAgreement(
    id,
    tradeType
) {


    const response =
        await apiFetch(
            `/api/rentalAgreement/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },


                body: JSON.stringify({

                    tradeType

                })

            }
        );


    const data =
        await handleResponse(response);


    return data;

}