const apiBaseUrl = "";

/**
 * Clears the current session and sends the user back
 * to the role selection page.
 */
function redirectToSelectRole() {

    sessionStorage.clear();

    window.location.href = "/select-role";

}

/**
 * Uses the refresh token to obtain a new access token.
 */
async function refreshAccessToken() {

    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("No refresh token found.");
    }

    const response = await fetch(`${apiBaseUrl}/refresh-token`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            refreshToken
        })

    });

    if (!response.ok) {
        throw new Error("Refresh token is invalid or expired.");
    }

    const data = await response.json();

    sessionStorage.setItem(
        "accessToken",
        data.accessToken
    );

    return data.accessToken;

}

/**
 * Wrapper around fetch().
 * Automatically:
 * 1. Sends the access token
 * 2. Refreshes it if expired
 * 3. Retries the original request
 */
export async function apiFetch(endpoint, options = {}) {

    let accessToken = sessionStorage.getItem("accessToken");

    options.headers = {
        ...(options.headers || {})
    };

    if (accessToken) {

        options.headers.Authorization =
            `Bearer ${accessToken}`;

    }

    let response = await fetch(
        `${apiBaseUrl}${endpoint}`,
        options
    );

    // Request succeeded
    if (response.status !== 401) {
        return response;
    }

    try {

        accessToken = await refreshAccessToken();

        options.headers.Authorization =
            `Bearer ${accessToken}`;

        response = await fetch(
            `${apiBaseUrl}${endpoint}`,
            options
        );

        // Refresh worked but retry still failed
        if (response.status === 401) {
            throw new Error("Authorisation failed.");
        }

        return response;

    }
    catch (error) {

        console.error("Authentication failed:", error);

        redirectToSelectRole();

        throw error;

    }

}
