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

//Retrieves menu item details
export async function getMenuItems() {
    // Sends API request
    const response = await apiFetch("/api/menuItems");
    return await handleResponse(response);
}

//Create menu
export async function createMenuItem(menuData) {
    const response = await apiFetch("/api/menuItems", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(menuData)
    });

    return await handleResponse(response);
}

//Update menu
export async function updateMenuItem(itemId, menuData) {
    const response = await apiFetch(`/api/menuItems/${itemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(menuData)
    });

    return await handleResponse(response);
}

//Delete menu item
export async function deleteMenuItem(itemId) {
    const response = await apiFetch(`/api/menuItems/${itemId}`, {
        method: "DELETE"
    });

    return await handleResponse(response);
}

//Adjust visibility of menu
export async function toggleMenuVisibility(itemId, visibility) {
    const response = await apiFetch(`/api/menuItems/${itemId}/visibility`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            visibility
        })
    });

    return await handleResponse(response);
}