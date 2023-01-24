const slider = document.querySelector(".slider");
const wrapper = slider.querySelector(".slider__wrapper");
const innerWrapper = wrapper.querySelector(".slider__inner-wrapper");
const buttonBack = slider.querySelector(".slider__button--back--js");
const buttonNext = slider.querySelector(".slider__button--next--js");
const pagination = slider.querySelector(".slider__pagination--js");
const slides = [...document.querySelectorAll(".slider__slide")];
const slidesCount = slides.length;
const animationDuration = 500;

let timer = null;
let slideWidth = wrapper.offsetWidth;
let activeSlideIndex = 0;
let dots = [];

window.addEventListener("resize", () => {
    initialWidth();
    setActiveSlide(activeSlideIndex, false);
});

function createDots () {
    for (let i = 0; i < slidesCount; i++) {
        const dot = createDot(i);
        dots.push(dot);
        pagination.insertAdjacentElement("beforeend", dot);
    }
}

function createDot (index) {
    const dot = document.createElement("button");
    dot.classList.add("slider__dot");

    if (index === activeSlideIndex) {
        dot.classList.add("slider__dot--active");
    }

    dot.addEventListener("click", () => {
        setActiveSlide(index);
        localStorage.setItem("activeSlide", activeSlideIndex);
    })

    return dot;
}

createDots(); 

function setActiveSlide (index, withAnimation = true) {
    if (index < 0 || index >= slidesCount) return;
    innerWrapper.style.transform = `translateX(${index * slideWidth * (-1)}px)`;

    buttonBack.removeAttribute("disabled", "");
    buttonNext.removeAttribute("disabled", "");

    if (withAnimation) {
        clearTimeout(timer);
        innerWrapper.style.transition = `transform ${animationDuration}ms`;
        timer = setTimeout(() => {
            innerWrapper.style.transition = "";
        })
    }

    if (index === 0) {
        buttonBack.setAttribute("disabled", "");
    }

    if (index === slidesCount - 1) {
        buttonNext.setAttribute("disabled", "");
    }

    dots[activeSlideIndex].classList.remove("slider__dot--active");
    dots[index].classList.add("slider__dot--active");
    activeSlideIndex = index;
}

initialWidth();
// setActiveSlide(0);

function initialWidth () {
    slideWidth = wrapper.offsetWidth;
    slides.forEach(slide => {
        slide.style.width = `${slideWidth}px`;
    });
}

buttonNext.addEventListener("click", () => {
    setActiveSlide(activeSlideIndex + 1);
    localStorage.setItem("activeSlide", activeSlideIndex);
})

buttonBack.addEventListener("click", () => {
    setActiveSlide(activeSlideIndex - 1);
        localStorage.setItem("activeSlide", activeSlideIndex);
})

// несброс слайдера

let activeSlide;

(() => {
    +localStorage.getItem("activeSlide") 
        ? (setActiveSlide(+localStorage.getItem("activeSlide")))
        : (setActiveSlide(0));
})();