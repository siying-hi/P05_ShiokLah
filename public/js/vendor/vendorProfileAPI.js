import { apiFetch } from "../utility/api.js";

export async function getVendorProfile(){
    const response = await apiFetch("/api/profile");
    if(!response.ok){
        throw new Error("Error retrieving vendor profile:");
    }
    return await response.json();
}