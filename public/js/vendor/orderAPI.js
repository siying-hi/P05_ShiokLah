import { apiFetch } from "../utility/api.js";

// Handle API errors
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


// Get vendor orders
export async function getVendorOrders() {

    const response =
    await apiFetch("/api/vendor/orders");

    return await handleResponse(response);

}


// Update order status
export async function updateOrderStatus(
    orderId,
    status
) {

    const response =
    await apiFetch(`/api/vendor/orders/${orderId}/status`, {

        method:"PUT",

        headers: {

            "Content-Type":
            "application/json"

        },

        body: JSON.stringify({

            order_status: status

        })

    });


    return await handleResponse(response);

}