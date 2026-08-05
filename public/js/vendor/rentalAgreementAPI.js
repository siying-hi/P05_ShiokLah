import { apiFetch } from "../utility/api.js";

async function handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            alert(data.message);
            sessionStorage.clear();
            window.location.href = "/select-role";
            return;
        }

        if (response.status === 403) {
            alert(data.message);
            window.location.href = "/select-role";
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
    const response = await apiFetch("/api/rentalAgreement");
    const data = await handleResponse(response);
    return data.data;
}

export async function getRentalAgreementById(id) {
    const response = await apiFetch(`/api/rentalAgreement/${id}`);
    const data = await handleResponse(response);
    return data.data;
}

export async function createRentalAgreement(aid, startDate, endDate) {
    const response = await apiFetch("/api/rentalAgreement", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            aid,
            startDate,
            endDate
        })
    });
    const data = await handleResponse(response);
    return data.data;
}

export async function updateRentalAgreement(
    id,
    tradeType
) {
    const response = await apiFetch(
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

    const data = await handleResponse(response);

    return data.data;


}
