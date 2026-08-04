import {
    getVendorCuisines,
    getCurrentCuisine,
    createCuisine,
    updateCuisine,
    deleteCuisine
} from "./cuisineAPI.js";


const accessToken = sessionStorage.getItem("accessToken");

if (!accessToken) {
    alert("Please log in to continue.");
    window.location.href = "/select-role";
}


const cuisineSelect = document.getElementById("cuisineSelect");
let deletableCuisines = [];
let selectedDeleteIndex = 0;

async function loadCuisine() {
    try {
        const cuisines = await getVendorCuisines();
        let currentCuisine = null;
        try {
            currentCuisine = await getCurrentCuisine();
        }
        catch (err) {
            console.error("Unable to get current cuisine:", err);
        }
        cuisineSelect.innerHTML = "";
        cuisines.forEach(cuisine => {
            const option = document.createElement("option");
            option.value = cuisine.cuisine_id;
            option.textContent = cuisine.cuisine_type;
            cuisineSelect.appendChild(option);
        });

        const separator = document.createElement("option");
        separator.disabled = true;
        separator.textContent = "──────────────";
        cuisineSelect.appendChild(separator);
        const addOption = document.createElement("option");
        addOption.value = "add";
        addOption.textContent = "+ Add Cuisine";
        cuisineSelect.appendChild(addOption);
        const deleteOption = document.createElement("option");
        deleteOption.value = "delete";
        deleteOption.textContent = "🗑 Delete Cuisine";
        cuisineSelect.appendChild(deleteOption);

        if (currentCuisine) {
            cuisineSelect.value = String(currentCuisine.cuisine_id);
        }
    }
    catch (err) {
        console.error(err);
    }
}

async function loadDeleteCuisine() {
    const cuisines = await getVendorCuisines();
    const currentCuisine = await getCurrentCuisine();

    // Filters out default cuisine types and current cuisine type of the stall
    deletableCuisines = cuisines.filter(cuisine =>
        Number(cuisine.default_status) === 0 &&
        cuisine.cuisine_id !== currentCuisine.cuisine_id
    );

    if (deletableCuisines.length === 0) {
        document.getElementById("deleteCuisineList").textContent = "No custom cuisines available or you have selected a custom cuisine.";
        return;
    }
    selectedDeleteIndex = 0;
    displayDeleteCuisine();
}

function displayDeleteCuisine() {
    const display = document.getElementById("deleteCuisineList");
    display.textContent = deletableCuisines[selectedDeleteIndex].cuisine_type;
}

cuisineSelect.addEventListener(
    "change",
    async () => {
        if (cuisineSelect.value === "add") {
            const cuisine = prompt("Enter new cuisine:");

            if (cuisine) {
                try {
                    const result = await createCuisine(cuisine);
                    await loadCuisine();
                    alert(result.message);
                }
                catch (err) {
                    await loadCuisine();
                    alert(err.message);
                }
            }
            return;
        }

        if (cuisineSelect.value === "delete") {
            await loadDeleteCuisine();
            document.getElementById("deleteCuisineModal").style.display = "block";
            return;
        }
        try {
            const result = await updateCuisine(cuisineSelect.value);
            alert(result.message);
        }
        catch (err) {
            alert(err.message);
        }
    });

// Previous cuisine button
document.getElementById("previousCuisine").addEventListener("click", () => {
    if (deletableCuisines.length === 0)
        return;

    selectedDeleteIndex--;

    if (selectedDeleteIndex < 0) {
        selectedDeleteIndex =
            deletableCuisines.length - 1;
    }
    displayDeleteCuisine();
});

// Next cuisine button
document.getElementById("nextCuisine").addEventListener("click", () => {
    if (deletableCuisines.length === 0)
        return;

    selectedDeleteIndex++;

    if (
        selectedDeleteIndex >=
        deletableCuisines.length
    ) {
        selectedDeleteIndex = 0;
    }
    displayDeleteCuisine();
});

// Cancel delete
document.getElementById("cancelDeleteCuisine").addEventListener("click", async () => {
    document.getElementById("deleteCuisineModal").style.display = "none";
    const currentCuisine = await getCurrentCuisine();
    cuisineSelect.value = String(currentCuisine.cuisine_id);
});

// Confirm delete
document.getElementById("confirmDeleteCuisine").addEventListener("click", async () => {
    if (deletableCuisines.length === 0) {
        alert(
            "No cuisine available to delete."
        );
        return;
    }
    const selected = deletableCuisines[selectedDeleteIndex];
    try {
        const result =
            await deleteCuisine(
                selected.cuisine_id
            );
        alert(result.message);
        document.getElementById("deleteCuisineModal").style.display = "none";
        await loadCuisine();
    }
    catch (err) {
        alert(err.message);
    }
});

document.addEventListener(
    "DOMContentLoaded",
    loadCuisine
);