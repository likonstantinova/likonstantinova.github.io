const registerModal = document.querySelector(".register-modal-js");
const openRegisterModal = document.querySelector(".register_modal-btn-js");
const closeRegisterModal = document.querySelectorAll(".modal__close-btn")[1];
const checkbox = document.querySelectorAll(".cb-js")[0];
const formBtn = document.querySelectorAll(".btn-register-js")[0];
const checkboxLabel = document.querySelectorAll(".cb-label-js")[0];
const openMobRegister = document.querySelector(".register-mob--js");

openMobRegister.addEventListener("click", (e) => {
    registerModal.classList.remove("hidden");
    registerModal.classList.add("modal");
})

openRegisterModal.addEventListener("click", function() {
    registerModal.classList.remove("hidden");
    registerModal.classList.add("modal");
});

closeRegisterModal.addEventListener("click", function() {
    registerModal.classList.remove("modal");
    registerModal.classList.add("hidden");
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModalByEsc(registerModal);
})

checkbox.addEventListener("click", function() {
    if (checkbox.checked) {
        formBtn.removeAttribute("disabled", "disabled");
        checkboxLabel.classList.remove("modal__form__checkbox-wrap__label-disabled");
    } else {
        formBtn.setAttribute("disabled", "disabled");
        checkboxLabel.classList.add("modal__form__checkbox-wrap__label-disabled");
    }
});

//валидация формы регистрации

(() => {
    const register = document.forms.register;

    register.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = register.elements.email;
        const name = register.elements.name;
        const surname = register.elements.surname;
        const password = register.elements.password;
        const repeatPassword = register.elements.repeatPassword;
        const location = register.elements.location;
        const age = register.elements.age;

        let errors = {};

        if (email.value.length <= 0) {
            errors.registerEmail = "This field is required";
        } else if (!email.value.match(/^[0-9a-z-\.]+\@[0-9a-z-]{2,}\.[a-z]{2,}$/i)) {
            errors.registerEmail = `Please enter a valid email address (your entry is not in the format "somebody@example.com")`;
        } else {
            showValidInput(email);
        }

        if (password.value.length <= 0) {
            errors.registerPassword = "This field is required";
        } else if (password.value.length > 0 && password.value.length < 4) {
            errors.registerPassword = "This password is too short";
        } else {
            showValidInput(password);
        }

        if (name.value.length <= 0) {
            errors.registerName = "This field is required";
        } else {
            showValidInput(name);
        }

        if (surname.value.length <= 0) {
            errors.surname = "This field is required";
        } else {
            showValidInput(surname);
        }

        if (password.value !== repeatPassword.value) {
            errors.repeatPassword = "The password doesn't match";
        } else if (repeatPassword.value.length <=0) {
            errors.repeatPassword = "This field is required";
        } else {
            showValidInput(repeatPassword);
        }
        

        if (location.value.length <= 0) {
            errors.location = "This field is required";
        } else {
            showValidInput(location);
        }

        if (age.value.length <= 0) {
            errors.age = "This field is required";
        } else if (age.value <= 15) {
            errors.age = "You must be 16 or older to register"
        } else {
            showValidInput(age);
        }

        if (Object.keys(errors).length) {
            errorFormHandler(errors, register);
            return;
        } else {
            console.log("Submitted");
            const data = {
                email: email.value,
                password: password.value,
                repeatPassword: repeatPassword.value,
                name: name.value,
                surname: surname.value,
                location: location.value,
                age: age.value,
            }
            showLoader();
            sendRequest({
                url: "/api/users",
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify(data),
            })
            .then(response => 
                response.json()
                )
            .then(response => {
                if(response.success) {
                    alert(`Пользователь с id ${response.data.id} и email ${response.data.email} зарегистрирован успешно`)
                    register.reset();
                    Object.keys(data).forEach((key) => {
                        removeValidInput(register.elements[key]);
                    })
                    registerModal.classList.remove("modal");
                    registerModal.classList.add("hidden");
                    rerendeLinks();
                } else {
                    throw response;
                }
            })
            .catch(err => {
                errorFormHandler(err.errors, register);
            })
            .finally(() => {
                hideLoader();
            })
        }

    })
})();