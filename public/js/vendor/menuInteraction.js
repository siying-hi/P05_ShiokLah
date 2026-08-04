const previewImg = document.getElementById("imagePreview");
const hint = document.getElementById("imageHint");
const removeImageBtn = document.getElementById("removeImageBtn");
const imageSelect = document.getElementById("imageSelect");


function showRemoveBtn(show) {
    if (!removeImageBtn) return;
    removeImageBtn.style.display = show ? "block" : "none";
}


export function clearImage() {

    if (!previewImg || !hint || !imageSelect)
        return;

    previewImg.src = "";
    previewImg.style.display = "none";

    hint.style.display = "block";

    showRemoveBtn(false);

    imageSelect.value = "placeholder.png";
    previewImg.src = "../images/placeholder.png";
    previewImg.style.display = "block";
    hint.style.display = "none";

    showRemoveBtn(false);
}


export function setImage(image) {

    if (!previewImg || !hint || !imageSelect)
        return;

    imageSelect.value = image;

    previewImg.src = `../images/${image}`;
    previewImg.style.display = "block";

    hint.style.display = "none";

    showRemoveBtn(true);
}


imageSelect?.addEventListener("change", () => {

    const file = imageSelect.value;

    if (!file) {
        clearImage();
        return;
    }

    setImage(file);

});


removeImageBtn?.addEventListener("click", clearImage);