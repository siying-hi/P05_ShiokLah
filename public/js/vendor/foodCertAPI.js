import { apiFetch } from "../utility/api.js";

const API_BASE = "/api/foodCert";

export async function getFoodCertificates() {
    const response = await apiFetch(API_BASE);
    if (!response.ok) {
        throw new Error("Unable to retrieve certificates.");
    }
    return await response.json();
}

export async function createCertificate(data) {
    const response = await apiFetch(API_BASE, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
        if (result.error) {
            throw result;
        }
        throw new Error(result.message || "Something went wrong.");
    }
    return result;
}

export async function updateCertificate(id, data) {
    const response = await apiFetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    if (!response.ok) {
        if (result.error) {
            throw result;          // Joi validation errors
        }
        throw new Error(result.message || "Unable to update food certificate details.");
    }
    return result;
}

export async function deleteCertificate(id) {

    const response = await apiFetch(`${API_BASE}/${id}`, {
        method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {

        throw new Error(
            result.message || "Failed to delete certificate."
        );
    }
    return result;
}