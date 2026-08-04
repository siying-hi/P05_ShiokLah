import { apiFetch } from "../utility/api.js";

//Get all cuisine types registered by vendors
export async function getVendorCuisines(){
    const response = await apiFetch("/api/cuisine");
    if(!response.ok){
        throw new Error("Unable to load cuisines.");
    }
    return await response.json();
}

//Get the selected cuisine type of that stall
export async function getCurrentCuisine() {
    const response = await apiFetch("/api/currentCuisine");
    if (!response.ok)
        throw new Error("Unable to load current cuisine.");
    return response.json();
}

//Allows vendor to create their own cuisine type if it is not available in the dropdown list
export async function createCuisine(cuisine){

    const response = await apiFetch("/api/cuisine", {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            cuisine_type:cuisine
        })
    });

    const data = await response.json();

    console.log("SERVER RESPONSE:", data);

    if (!response.ok) {
        throw new Error(data.message || "Failed to create cuisine.");
    }

    return data;
}


//Updates cuisine type for that stall when vendor selects a new cuisine type from the dropdown
export async function updateCuisine(cuisineId) {
    const response = await apiFetch(`/api/cuisine/${cuisineId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error("Unable to update cuisine.");
    }
    return await response.json();
}

export async function deleteCuisine(id){
    const response=
        await apiFetch(`/api/cuisine/${id}`,{
            method:"DELETE"
        });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
}