import {
    clearImage,
    setImage
} from "./menuInteraction.js";

let editMode = false;
let editingItemId = null;
// Controls whether the form is in edit mode or add menu item mode

const modal = document.getElementById("menuModal");
const overlay = document.getElementById("menuOverlay"); //overlay is the dark background behind the modal
const cancelBtn = document.getElementById("cancelModal");
const addBtn = document.getElementById("addBtn");

function openModal() {
    if (!modal) return;
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    if (!modal) return;
    modal.classList.remove("show");
    document.body.style.overflow = "";
}

//Sets form mode to add menu items
function setFormModeAdd() {
    editMode = false;
    editingItemId = null;
    document.getElementById("formTitle").textContent = "Add Menu Item";
    const confirmBtn = document.querySelector(".confirm-btn");
    confirmBtn.textContent = "Confirm";
    document.getElementById("menuForm").reset();

    clearImage();
    document.getElementById("menuForm").reset();
    setImage("placeholder.png");
}

function isEditMode() {
    return editMode;
}

function getEditingItemId() {
    return editingItemId;
}

//Sets form mode to edit menu items, by setting editMode to true and getting the item's id
function setFormModeEdit(item) {

    editMode = true;
    editingItemId = item.item_id;

    document.getElementById("formTitle").textContent = "Edit Menu Item";

    document.querySelector(".confirm-btn").textContent = "Update Menu Item";     //Changes the confirm button to say this

    document.getElementById("itemName").value = item.item_name || "";

    document.getElementById("itemPrice").value = item.price || "";

    document.getElementById("itemEWT").value = item.estimated_waiting_time || "";

    document.getElementById("itemDesc").value = item.food_description || "";

    document.getElementById("itemAllergen").value = item.allergen_info || "";

    const image = item.image_name || "";

    if (image) {
        setImage(image);
    }
    else {
        clearImage();
    }
}

//When vendor selects the add button, the form is set to add menu items
addBtn?.addEventListener("click", () => {
    setFormModeAdd();
    openModal();
});
//When vendor selects the area outside of the form, the form closes
overlay?.addEventListener("click", () => {
    setFormModeAdd();
    closeModal();
});

//When vendor selects the cancel button inside the form, the form closes
cancelBtn?.addEventListener("click", () => {
    setFormModeAdd();
    closeModal();
});

export {
    openModal,
    closeModal,
    setFormModeAdd,
    setFormModeEdit,
    isEditMode,
    getEditingItemId
};
