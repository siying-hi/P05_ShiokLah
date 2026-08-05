let editMode = false;
let editingCertificateId = null;


const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("foodCertModal");
const overlay = document.getElementById("foodCertOverlay");
const cancelBtn = document.getElementById("cancelModal");
const form = document.getElementById("foodCertForm");
const certificatePicture = document.getElementById("certificatePicture");
const certificatePicturePreview = document.getElementById("certificatePicturePreview");
const certificatePicturePreviewImage = document.getElementById("certificatePicturePreviewImage");
const certificatePictureFileName = document.getElementById("certificatePictureFileName");


// Open modal
export function openModal() {

    modal.style.display = "flex";

}


// Close modal
export function closeModal() {

    modal.style.display = "none";

    form.reset();

    clearErrors();

    clearCertificatePicturePreview();

}


// Add mode
export function setFormModeAdd() {

    editMode = false;

    editingCertificateId = null;

    form.reset();

    clearErrors();

    certificatePicture.required = true;

    clearCertificatePicturePreview();

    document.getElementById("formTitle").textContent =
        "Add Food Handler Certificate";

}


// Edit mode
export function setFormModeEdit(cert) {

    editMode = true;

    editingCertificateId = cert.certificate_id;


    document.getElementById("formTitle").textContent =
        "Update Food Handler Certificate";


    document.getElementById("certificateName").value =
        cert.certificate_name;


    document.getElementById("issueDate").value =
        cert.issue_date.substring(0,10);


    document.getElementById("expiryDate").value =
        cert.expiry_date.substring(0,10);


    document.getElementById("issuingAuthority").value =
        cert.issuing_authority;

    certificatePicture.required = false;

    clearCertificatePicturePreview();

    clearErrors();

}


// Check edit mode
export function isEditMode() {

    return editMode;

}


// Get editing ID
export function getEditingCertificateId() {

    return editingCertificateId;

}



// ---------------------------
// Validation Handling
// ---------------------------

function clearErrors() {

    document.querySelectorAll(".error-message")
        .forEach(error => {

            error.textContent = "";

        });

}

function clearCertificatePicturePreview() {

    certificatePicture.value = "";

    certificatePicturePreviewImage.removeAttribute("src");

    certificatePictureFileName.textContent = "";

    certificatePicturePreview.hidden = true;

}

certificatePicture.addEventListener("change", () => {

    const file = certificatePicture.files[0];

    document.getElementById("certificatePictureError").textContent = "";

    if (!file) {
        clearCertificatePicturePreview();
        return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        document.getElementById("certificatePictureError").textContent =
            "Certificate picture must be a JPG, PNG, or WEBP image.";
        clearCertificatePicturePreview();
        return;
    }

    if (file.size > 8 * 1024 * 1024) {
        document.getElementById("certificatePictureError").textContent =
            "Certificate picture must be 8 MB or smaller.";
        clearCertificatePicturePreview();
        return;
    }

    const previewUrl = URL.createObjectURL(file);
    certificatePicturePreviewImage.src = previewUrl;
    certificatePicturePreviewImage.onload = () => URL.revokeObjectURL(previewUrl);
    certificatePictureFileName.textContent = file.name;
    certificatePicturePreview.hidden = false;

});


export function showValidationErrors(errors) {

    clearErrors();


    errors.forEach(message => {


        if (message.includes("Certificate name")) {

            document.getElementById("certificateNameError")
                .textContent = message;

        }


        if (message.includes("Issue date")) {

            document.getElementById("issueDateError")
                .textContent = message;

        }


        if (message.includes("Expiry date")) {

            document.getElementById("expiryDateError")
                .textContent = message;

        }


        if (message.includes("Issuing authority")) {

            document.getElementById("issuingAuthorityError")
                .textContent = message;

        }

        if (message.includes("Certificate picture")) {

            document.getElementById("certificatePictureError")
                .textContent = message;

        }

    });

}



// ---------------------------
// Modal Buttons
// ---------------------------

addBtn.addEventListener("click", () => {

    setFormModeAdd();

    openModal();

});


cancelBtn.addEventListener("click", () => {

    closeModal();

    setFormModeAdd();

});


overlay.addEventListener("click", () => {

    closeModal();

    setFormModeAdd();

});
