// РЕАЛИЗАЦИЯ ПОСТОВ 

const SERVER_URL = "https://academy.directlinedev.com";
const filterForm = document.forms.filter;
const LIMIT = 5;
const paginationBtnPrev = document.querySelector(".blog__pagination__btn__prev--js");
const paginationBtnNext = document.querySelector(".blog__pagination__btn__next--js");

(function() {
    filterForm.addEventListener("submit", (e) => {
        e.preventDefault();

        let data = {
            page: 0,
        };

        data.tags = [...filterForm.elements.tags].filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
        data.views = ([...filterForm.elements.views].find(radio => radio.checked) || {value: null}).value;
        data.comments = [...filterForm.elements.comments].filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
        data.sort = ([...filterForm.elements.sort].find(radio => radio.checked) || {value: null}).value;
        data.howShow = ([...filterForm.elements.howShow].find(radio => radio.checked) || {value: null}).value;

        getData(data);
        setSearchParams(data);

        console.log(data.howShow);
    })

    let xhr = new XMLHttpRequest();
    xhr.open("GET", SERVER_URL + "/api/tags");
    xhr.send();
    showLoader();
    xhr.onload = () => {
        const tags = JSON.parse(xhr.response).data;
        const tagsBox = document.querySelector(".blog__filter-section__filter--tags");
        tags.forEach(tag => {
            const tagHTML = createTag(tag);
            tagsBox.insertAdjacentHTML("beforeend", tagHTML);
        })

        const params = getParamsFromLocation();
        setDataToFilter(params);
        getData(params);
        hideLoader();
    }
})()

function getParamsFromLocation() {
    let searchParams = new URLSearchParams(location.search);
    return {
        tags: searchParams.getAll("tags"),
        views: searchParams.get("views"),
        comments: searchParams.getAll("comments"),
        sort: searchParams.get("sort"),
        howShow: searchParams.get("howShow"),
        page: +searchParams.get("page") || 0,
    }
}

function setSearchParams(data) {
    let searchParams = new URLSearchParams();
    if(data.page) {
        searchParams.set("page", data.page)
    } else { 
        searchParams.set("page", 0);
    }
    data.tags.forEach(tag => {
        searchParams.append("tags", tag);
    });
    if(data.sort) {
        searchParams.set("sort", data.sort);
    }
    if(data.views) {
        searchParams.set("views", data.views);
    }
    data.comments.forEach(comment => {
        searchParams.append("comments", comment);
    });
    if(data.howShow) {
        searchParams.set("howShow", data.howShow);
    }
    history.replaceState(null, document.title, "?" + searchParams.toString());
}

function getData(params) {
    const result = document.querySelector(".blog__filter-section__posts--js");
    let xhr = new XMLHttpRequest();
    let searchParams = new URLSearchParams();
    searchParams.set("v", "1.0.0");

    if(params.tags && Array.isArray(params.tags) && params.tags.length) {
        searchParams.set("tags", JSON.stringify(params.tags));
    }

    let filter = {};
    if(params.views) {
        let minViews = params.views.split("-")[0];
        let maxViews = params.views.split("-")[1];

        filter.views = {
            "$between": [minViews, maxViews]
        };
    }
    if(params.comments && params.comments.length) {
        let minComments;
        let maxComments;
        switch(params.comments.length > 1) {
            case `${[filterForm.elements.comments].length}`: {
                minComments = params.comments[0];
                maxComments = params.comments[params.comments-1];
                break;
            }
            default: {
                minComments = params.comments[0].split("-")[0]; //[0] || [0-1]
                maxComments = params.comments[params.comments.length-1].split("-")[1];
                break;
            }
        }

        if(params.comments.length === 1 && params.comments[0] === "0") {
            minComments = 0;
            maxComments = 0;
        }

        filter.commentsCount = {
                "$between": [minComments, maxComments],
            }

        }
        searchParams.set("filter", JSON.stringify(filter));

    if(params.howShow === "show-10") {
        searchParams.set("limit", 10)
    } else {
        searchParams.set("limit", LIMIT);
    }

    if(+params.page) {
        searchParams.set("offset", (+params.page )* LIMIT);
    }

    if(params.sort) {
        searchParams.set("sort", JSON.stringify([params.sort, "DESC"]));
    }

    xhr.open("GET", SERVER_URL + "/api/posts?" + searchParams.toString());
    xhr.send();
    showLoader();
    result.innerHTML = "";
    const linksContainer = document.querySelector(".blog__pagination--js");
    linksContainer.innerHTML = "";
    xhr.onload = () => {
        const response = JSON.parse(xhr.response);
        let dataPosts = "";
        response.data.forEach(post => {
            dataPosts += cardCreate({
                title: post.title, 
                text: post.text,
                src: post.photo.desktopPhotoUrl,
                srcMob: post.photo.mobilePhotoUrl,
                tags: post.tags,
                date: post.date,
                views: post.views,
                commentsCount: post.commentsCount,
            });
        })
        result.innerHTML = dataPosts;

        const pageCount = Math.ceil(response.count / LIMIT);
        for (let i = 0; i < pageCount; i++) {
            const link = linkElementCreate(i);
            linksContainer.insertAdjacentElement("beforeend", link);
            linksContainer.insertAdjacentHTML("beforeend", "");
        }

        hideLoader();
    }
}

function linkElementCreate(page) {
    const link = document.createElement("a");
    link.href = "?page=" + page;
    link.innerText = page + 1;
    link.classList.add("blog__pagination__link"); //стили пагинации

    let params = getParamsFromLocation();
    if (page === +params.page) {
        link.classList.add("blog__pagination__link--active");
    }
    
    link.addEventListener("click", (e) => {
        e.preventDefault();
        
        const links = document.querySelectorAll(".blog__pagination__link");
        paginationBtnPrev.removeAttribute("disabled", "disabled");
        paginationBtnNext.removeAttribute("disabled", "disabled");
        let searchParams = new URLSearchParams(location.search);
        let params = getParamsFromLocation();
        links[params.page].classList.remove("blog__pagination__link--active");
        searchParams.set("page", page);
        links[page].classList.add("blog__pagination__link--active");
        history.replaceState(null, document.title, "?" + searchParams.toString());
        getData(getParamsFromLocation());
        if(page === 0) {
            paginationBtnPrev.setAttribute("disabled", "disabled");
        }
        if(page === links.length - 1) {
            paginationBtnNext.setAttribute("disabled", "disabled");
        }
    })

    return link;
}

function cardCreate ({title, text, src, srcMob, tags, commentsCount, date, views}) {  

date = new Date(date);
let year = date.getFullYear();
let month = date.getMonth() + 1;
let day = date.getDate();
  
  if (month < 10) {
    month = '0' + month;
  }
  if (day < 10) {
    day = '0' + day;
  }

const finalDate = `${day}.${month}.${year}`;

console.log(tags);

    return `
        <div class="blog__card">
        <picture>
            <source media="(max-width:376px)" srcset="${SERVER_URL}${srcMob}" alt="${title}">
            <img src="${SERVER_URL}${src}" class="blog__card__img" alt="${title}">
        </picture>
            <div class="blog__card__body">
                ${tags.map(tag => `<div class="blog__card__tag-color" style="background-color: ${tag.color}"></div>`).join("")}
                <div class="blog__card__info-wrap">
                    <span>${finalDate}</span>
                    <span>${views} views</span>
                    <span>${commentsCount} comments</span>
                </div>
                <h5 class="blog__card__title">${title}</h5>
                <p class="blog__card__text">${text}</p>
                <a href="#" class="blog__card__link">Go to this post</a>
            </div>
        </div>
        <hr>
    `
}

function setDataToFilter (data) {
    filterForm.elements.tags.forEach(checkbox => {
        checkbox.checked = data.tags.includes(checkbox.value);
    });
    filterForm.elements.sort.forEach(radio => {
        radio.checked = data.sort === radio.value;
    });
    filterForm.elements.views.forEach(radio => {
        radio.checked = data.views === radio.value;
    });
    filterForm.elements.comments.forEach(checkbox => {
        checkbox.checked = data.comments.includes(checkbox.value);
    });
    filterForm.elements.howShow.forEach(radio => {
        radio.checked = data.howShow === radio.value;
    });
}


function createTag({id, color}) {
    return `
    <label for="${id}">
        <input type="checkbox" style="color: ${color};" class="checkbox" id="${id}" value="${id}" name="tags">
    </label>
    `
}

paginationBtnNext.addEventListener("click", (e) => {
    const links = document.querySelectorAll(".blog__pagination__link");
    let searchParams = new URLSearchParams(location.search);
    let params = getParamsFromLocation();
    if(params.page === 0) {
        paginationBtnPrev.removeAttribute("disabled", "disabled");
    } else if (params.page === (links.length) - 2) {
        paginationBtnNext.setAttribute("disabled", "disabled");
    }
    links[params.page].classList.remove("blog__pagination__link--active");
    let nextPage = params.page + 1;
    searchParams.set("page", nextPage);
    links[nextPage].classList.add("blog__pagination__link--active");
    history.replaceState(null, document.title, "?" + searchParams.toString());
    getData(getParamsFromLocation());
})


paginationBtnPrev.addEventListener("click", (e) => {
    const links = document.querySelectorAll(".blog__pagination__link");
    let searchParams = new URLSearchParams(location.search);
    let params = getParamsFromLocation();
    links[params.page].classList.remove("blog__pagination__link--active");
    let prevPage = params.page - 1;
    let nextPage = params.page + 1;
    if(nextPage <= 1 || prevPage === 0) {
        paginationBtnPrev.setAttribute("disabled", "disabled");
    } else if (params.page === links.length - 1) {
        paginationBtnNext.removeAttribute("disabled", "disabled");
    }
    searchParams.set("page", prevPage);
    links[prevPage].classList.add("blog__pagination__link--active");
    history.replaceState(null, document.title, "?" + searchParams.toString());
    getData(getParamsFromLocation());
})

//НЕСБРОС ФИЛЬТРОВ//


//проверяем наличие поискового запроса в нашем URL
if (location.search) {
    //создаем объект будущих параметров
    const params = {};
    //создаем массив строк параметров
    const arrayStringParams = location.search.substring(1).split("&");
    //делаем перебор массива
    for (let stringParam of arrayStringParams) {
        let param = stringParam.split("=");
        let nameParam = param[0];
        let valueParam = param[1];
        if (nameParam in params) {
            params[nameParam].push(valueParam);
        } else {
            params[nameParam] = [valueParam];
        }
    }
    const updateInput = (gInputs, typeParam) => {
            for (let input of gInputs) {
                const param = params[typeParam];
                for (partParam of param) {
                    if(partParam === input.value) input.checked = true;
                }
            }
        }
        
        updateInput(filterForm.elements.tags, "tags");
        updateInput(filterForm.elements.views, "views");
        updateInput(filterForm.elements.comments, "comments");
        updateInput(filterForm.elements.howShow, "howShow");
        updateInput(filterForm.elements.sort, "sort");
    }

const url = new URL(location.pathname, location.origin);

filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    url.searchParams.delete("tags");
    url.searchParams.delete("views");
    url.searchParams.delete("comments");
    url.searchParams.delete("howShow");
    url.searchParams.delete("sort");

    const addCheckedInput = (nameGroupInput, typeParam) => {
        for (checkbox of nameGroupInput) {
            if (checkbox.checked) {
                url.searchParams.append(typeParam, checkbox.value);
            }
        }
    }

    addCheckedInput(e.target.tags, "tags");
    addCheckedInput(e.target.views, "views");
    addCheckedInput(e.target.comments, "comments");
    addCheckedInput(e.target.howShow, "howShow");
    addCheckedInput(e.target.sort, "sort");

    history.replaceState(null, "", url);
})