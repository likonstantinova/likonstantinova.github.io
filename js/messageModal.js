const openMessageModal = document.querySelector(".msg-btn-js");
const messageModal = document.querySelector(".message-modal-js");
const closeMessageModal = document.querySelector(".modal__close-btn--msg");
const checkboxMessage = document.querySelectorAll(".cb-js")[1];
const formBtnMessage = document.querySelectorAll(".btn-register-js")[1];
const checkboxLabelMessage = document.querySelectorAll(".cb-label-js")[1];

checkboxMessage.addEventListener("click", function() {
    if (checkboxMessage.checked) {
        formBtnMessage.removeAttribute("disabled", "disabled");
        checkboxLabelMessage.classList.remove("modal__form__checkbox-wrap__label-disabled");
    } else {
        formBtnMessage.setAttribute("disabled", "disabled");
        checkboxLabelMessage.classList.add("modal__form__checkbox-wrap__label-disabled");
    }
});

openMessageModal.addEventListener("click", function() {
    messageModal.classList.remove("hidden");
    messageModal.classList.add("modal");
});

closeMessageModal.addEventListener("click", function() {
    messageModal.classList.remove("modal");
    messageModal.classList.add("hidden");
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModalByEsc(messageModal);
});

//валидация формы отправки сообщения

(() => {
    const messageForm = document.forms.message;

    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();

        let error = {};

        const name = messageForm.elements.name;
        const subject = messageForm.elements.subject;
        const email = messageForm.elements.email;
        const phone = messageForm.elements.phone;
        const message = messageForm.elements.message;

        if (name.value.length <= 0) {
            error.name = "This field is required";
        } else {
            showValidInput(name);
        }

        if (subject.value.length <= 0) {
            error.subject = "This field is required";
        } else {
            showValidInput(subject);
        }

        if (email.value.length <= 0) {
            error.email = "This field is required";
        } else if (!email.value.match(/^[0-9a-z-\.]+\@[0-9a-z-]{2,}\.[a-z]{2,}$/i)) {
            error.email = `Please enter a valid email address (your entry is not in the format "somebody@example.com")`;
        } else {
            showValidInput(email);
        }

        if (phone.value.length <= 0) {
            error.phone = "This field is required";
        } else if (!phone.value.match(/^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/)) {
            error.phone = `Please enter a valid phone (your entry is not in the format "+7 XXX XXX XX XX)"`;
        } else {
            showValidInput(phone);
        }

        if (Object.keys(error).length) {
            errorFormHandler(error, messageForm);
            return;
        } else {
            showValidInput(message);
            const data = {
                name: name.value,
                subject: subject.value,
                email: email.value,
                phone: phone.value,
                message: message.value,
            }
            const dataToSend = {
                to: email.value,
                body: JSON.stringify(data),
            }
            showLoader();
            sendRequest({
                url: "/api/emails",
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify(dataToSend),
            })
            .then(response => 
                response.json()
                )
            .then(response => {
                if(response.success) {
                    alert(`Sent successfully`)
                    messageForm.reset();
                    Object.keys(data).forEach((key) => {
                        removeValidInput(messageForm.elements[key]);
                    })
                    messageModal.classList.remove("modal");
                    messageModal.classList.add("hidden");
                } else {
                    throw response;
                }
            })
            .catch(err => {
                errorFormHandler(err.errors, messageForm);
            })
            .finally(() => {
                hideLoader();
            })
        }

    })
})();