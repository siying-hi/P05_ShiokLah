import {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuVisibility
} from "./menuAPI.js";

import {
    openModal,
    closeModal,
    setFormModeAdd,
    setFormModeEdit,
    isEditMode,
    getEditingItemId
} from "./menuUI.js";

// Check if user has logged in
const accessToken = sessionStorage.getItem("accessToken");
if (!accessToken) {

    alert("Please log in to continue.");

    window.location.href = "/select-role";

}

// Menu Item Rendering

let editMode = false;
let editingItemId = null;
let visibilityFilter = "all";

//Visibility Filter
function applyVisibilityFilter(items) {

    if (visibilityFilter === "visible") {

        return items.filter(
            item => item.visibility == 1
        );

    }


    if (visibilityFilter === "hidden") {

        return items.filter(
            item => item.visibility == 0
        );

    }


    // All: visible first, hidden below
    return [...items].sort(
        (a, b) => Number(b.visibility) - Number(a.visibility)
    );

}

//Render vendor menu
function renderVendorMenu(menuItems) {
    const list = document.getElementById("menuList");
    if (!list) return;

    list.innerHTML = "";

    if (!menuItems || menuItems.length === 0) {

        let title = "No Menu Items";
        let message = "No menu items found.";

        if (visibilityFilter === "visible") {
            title = "No Visible Items";
            message = "There are no visible menu items.";
        }
        else if (visibilityFilter === "hidden") {
            title = "No Hidden Items";
            message = "There are no hidden menu items.";
        }

        list.innerHTML = `
        <div class="empty-menu-card">

            <div class="empty-icon">
                🍽️
            </div>

            <h3>
                ${title}
            </h3>

            <p>
                ${message}
            </p>

            <p class="empty-hint">
                ${visibilityFilter === "all"
                ? "Select the + button above to get started."
                : "Try changing the visibility filter."}
            </p>

        </div>
        `;

        return;
    }


    menuItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "menu-card";

        card.innerHTML = `

            <img
                src="../images/${item.image_name}"
                alt="${item.item_name}"
                class="menu-image"
            >

            <div class="item-details">

                <h3>${item.item_name}</h3>

                <p>
                    <strong>Price:</strong>
                    $${Number(item.price).toFixed(2)}
                </p>

                <p>
                    <strong>EWT:</strong>
                    ${item.estimated_waiting_time} mins
                </p>

                <p>
                    <strong>Description:</strong>
                    ${item.food_description || "-"}
                </p>

                <p>
                    <strong>Allergen:</strong>
                    ${item.allergen_info || "None"}
                </p>

            </div>

            <div class="actions">

                <button
                    class="icon-btn edit-btn"
                    type="button"
                    title="Edit">

                    <img src="../images/edit-text.png" alt="Edit">

                </button>

                <button
                    class="icon-btn delete-btn"
                    type="button"
                    title="Delete">

                    <img src="../images/delete.png" alt="Delete">

                </button>

                <button
                    class="icon-btn vis-btn"
                    type="button"
                    title="${Number(item.visibility) ? "Hide" : "Show"}">

                    <img
                        src="../images/${Number(item.visibility) ? "view.png" : "visible.png"}"
                        alt="Visibility">

                </button>

            </div>

        `;


        // Grey out hidden menu items
        if (Number(item.visibility) === 0) {
            card.classList.add("is-hidden");
        }


        // Edit
        card.querySelector(".edit-btn")
            .addEventListener("click", () => {
                setFormModeEdit(item);
                openModal();
            });


        // Delete
        card.querySelector(".delete-btn")
            .addEventListener("click", async () => {
                const confirmed = confirm(
                    `Delete "${item.item_name}"?`
                );

                if (!confirmed) return;

                try {
                    const result = await deleteMenuItem(item.item_id);
                    alert(result.message);
                    await loadMenuItems();
                }
                catch (err) {
                    console.error(err);
                    alert(err.message);
                }
            });


        // Visibility
        card.querySelector(".vis-btn")
            .addEventListener("click", async () => {
                try {
                    const newVisibility = Number(item.visibility) === 0;

                    await toggleMenuVisibility(
                        item.item_id,
                        newVisibility
                    );

                    await loadMenuItems();
                }
                catch (err) {
                    console.error(err);
                    alert(err.message);
                }
            });


        list.appendChild(card);

    });
}

//Load Menu Items
async function loadMenuItems() {
    try {
        const menuItems = await getMenuItems();
        // console.log("Current filter:", visibilityFilter);
        // console.log("Before filter:", menuItems);
        const filteredItems = applyVisibilityFilter(menuItems);
        // console.log("After filter:", filteredItems);
        renderVendorMenu(filteredItems);
    }
    catch (err) {
        console.error(err);
    }
}

//Loading menu items
document.addEventListener("DOMContentLoaded", async () => {
    await loadMenuItems();
    document
        .querySelectorAll(".visibility-filter button")

        .forEach(button => {

            button.addEventListener("click", () => {

                visibilityFilter =
                    button.dataset.filter;
                document
                    .querySelectorAll(".visibility-filter button")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");
                loadMenuItems();
            });

        });
});

//Form Submit Listener
const menuForm = document.getElementById("menuForm");

menuForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const menuData = {
        item_name:
            document.getElementById("itemName").value.trim(),
        price:
            Number(document.getElementById("itemPrice").value),
        estimated_waiting_time:
            Number(document.getElementById("itemEWT").value),
        food_description:
            document.getElementById("itemDesc").value.trim(),
        allergen_info:
            document.getElementById("itemAllergen").value.trim(),
        image_name:
            document.getElementById("imageSelect").value
    };

    try {
        if (isEditMode()) {
            const result = await updateMenuItem(getEditingItemId(), menuData);
            alert(result.message);
        }

        else {
            const result = await createMenuItem(menuData);
            alert(result.message);
        }

        closeModal();
        setFormModeAdd();
        await loadMenuItems();
    }

    catch (err) {
        console.error(err);

        alert(
            err.message ||
            "Unable to save menu item. Please try again."
        );
    }

});