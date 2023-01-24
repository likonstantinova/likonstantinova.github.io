const changePasswordModal = document.querySelector(".change-password-modal-js");
const passwordBtn = document.querySelector(".password-btn-js");
const closeChangePasswordModal = document.querySelectorAll(".modal__close-btn")[2];

const changeDataModal = document.querySelector(".change-data-modal-js");
const dataBtn = document.querySelector(".data-btn-js");
const closeChangeDataModal = document.querySelectorAll(".modal__close-btn")[3];

console.log(dataBtn);

passwordBtn.addEventListener("click", () => {
    changePasswordModal.classList.remove("hidden");
    changePasswordModal.classList.add("modal");
})

dataBtn.addEventListener("click", () => {
    changeDataModal.classList.remove("hidden");
    changeDataModal.classList.add("modal");
})

closeChangePasswordModal.addEventListener("click", () => {
    changePasswordModal.classList.remove("modal");
    changePasswordModal.classList.add("hidden"); 
})

closeChangeDataModal.addEventListener("click", () => {
    changeDataModal.classList.remove("modal");
    changeDataModal.classList.add("hidden");
})

window.addEventListener("keydown", (e) => {
    if(e.key === "Escape") {
        changePasswordModal.classList.remove("modal");
        changePasswordModal.classList.add("hidden");
        changeDataModal.classList.remove("modal");
        changeDataModal.classList.add("hidden");
    }
})