import { apiFetch } from "../utility/api.js";

async function handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {

        // Unauthorised
        if (response.status === 401) {
            alert(data.message);
            sessionStorage.clear();
            window.location.href = "/select-role";
            return;
        }

        // Forbidden
        if (response.status === 403) {
            alert(data.message);
            window.location.href = "/select-role";
            return;
        }

        // Validation middleware errors
        if (Array.isArray(data.error)) {
            throw new Error(data.error.join("\n"));
        }

        // Controller errors
        throw new Error(data.message || data.error || "An unexpected error occurred.");
    }

    return data;
}

// Get feedback
export async function getFeedback() {
    const response = await apiFetch("/api/vendor-feedback");
    return await handleResponse(response);
}

// Get complaints
export async function getComplaints() {
    const response = await apiFetch("/api/vendor-complaint");
    return await handleResponse(response);
}