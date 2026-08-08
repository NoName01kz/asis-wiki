/*
=====================================================
A.S.I.S.
ARCHIVE SURVIVAL INFORMATION SYSTEM

news.js
Динамическая страница новостей
=====================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    loadNews();

});


/* =====================================================
ГЛОБАЛЬНЫЕ ДАННЫЕ
===================================================== */

let newsArchive = [];

let currentCategory = "all";

let currentSearch = "";


/* =====================================================
ЗАГРУЗКА NEWS.JSON
===================================================== */

async function loadNews() {

    try {

        const response = await fetch("news.json", {
            cache: "no-store"
        });


        if (!response.ok) {

            throw new Error(
                `Ошибка загрузки news.json: ${response.status}`
            );

        }


        newsArchive = await response.json();


        if (!Array.isArray(newsArchive)) {

            throw new Error(
                "news.json должен содержать массив новостей"
            );

        }


        console.log(
            "%cA.S.I.S NEWS ONLINE",
            "color:#39D98A;font-size:18px;font-weight:bold"
        );


        console.log(
            `Загружено новостей: ${newsArchive.length}`
        );


        initNewsFilters();

        initNewsSearch();

        renderNews();


    }
    catch (error) {

        console.error(
            "A.S.I.S NEWS DATABASE ERROR:",
            error
        );


        showNewsError();

    }

}


/* =====================================================
ФИЛЬТРЫ КАТЕГОРИЙ
===================================================== */

function initNewsFilters() {

    const filters =
        document.querySelectorAll(
            ".news-filters .filter, .news-filter, [data-category]"
        );


    if (!filters.length) {

        console.warn(
            "Кнопки категорий новостей не найдены"
        );

        return;

    }


    filters.forEach(filter => {

        filter.addEventListener(
            "click",
            () => {

                const category =
                    filter.dataset.category ||
                    "all";


                currentCategory =
                    normalize(category);


                filters.forEach(button => {

                    button.classList.remove(
                        "active"
                    );

                });


                filter.classList.add(
                    "active"
                );


                renderNews();

            }
        );

    });

}


/* =====================================================
ПОИСК
===================================================== */

function initNewsSearch() {

    const search =
        document.querySelector(
            "#newsSearch"
        ) ||
        document.querySelector(
            ".news-search input"
        ) ||
        document.querySelector(
            ".archive-search input"
        );


    if (!search) {

        console.warn(
            "Поле поиска новостей не найдено"
        );

        return;

    }


    search.addEventListener(
        "input",
        event => {

            currentSearch =
                normalize(
                    event.target.value
                );


            renderNews();

        }
    );

}


/* =====================================================
ФИЛЬТРАЦИЯ НОВОСТЕЙ
===================================================== */

function getFilteredNews() {

    return newsArchive.filter(news => {


        /* -----------------------------------------
        КАТЕГОРИЯ
        ----------------------------------------- */

        const newsCategory =
            getNewsCategory(news);


        let categoryMatch = true;


        if (
            currentCategory &&
            currentCategory !== "all" &&
            currentCategory !== "все"
        ) {

            categoryMatch =
                newsCategory ===
                currentCategory;

        }


        if (!categoryMatch) {

            return false;

        }


        /* -----------------------------------------
        ПОИСК
        ----------------------------------------- */

        if (!currentSearch) {

            return true;

        }


        const searchableText = normalize(
            [
                news.title,
                news.name,
                news.description,
                news.text,
                news.content,
                news.category,
                news.type,
                news.date
            ]
            .filter(Boolean)
            .join(" ")
        );


        return searchableText.includes(
            currentSearch
        );

    });

}


/* =====================================================
ОПРЕДЕЛЕНИЕ КАТЕГОРИИ
===================================================== */

function getNewsCategory(news) {

    return normalize(
        news.category ||
        news.type ||
        news.section ||
        news.tag ||
        ""
    );

}


/* =====================================================
ОТРИСОВКА НОВОСТЕЙ
===================================================== */

function renderNews() {

    const container =
        document.querySelector(
            ".news-grid"
        );


    if (!container) {

        console.warn(
            "Элемент .news-grid не найден"
        );

        return;

    }


    const filteredNews =
        getFilteredNews();


    if (!filteredNews.length) {

        container.innerHTML = `

            <div class="news-empty">

                <div class="news-empty-code">
                    NO RESULTS
                </div>

                <h3>
                    НОВОСТИ НЕ НАЙДЕНЫ
                </h3>

                <p>
                    По выбранным параметрам
                    материалов не обнаружено.
                </p>

            </div>

        `;

        updateNewsCount(0);

        return;

    }


    container.innerHTML = "";


    filteredNews.forEach(news => {

        container.insertAdjacentHTML(
            "beforeend",
            createNewsCard(news)
        );

    });


    updateNewsCount(
        filteredNews.length
    );

}


/* =====================================================
КАРТОЧКА НОВОСТИ
===================================================== */

function createNewsCard(news) {

    const id =
        news.id ||
        "";


    const title =
        news.title ||
        news.name ||
        "Без названия";


    const category =
        news.category ||
        news.type ||
        "НОВОСТИ";


    const description =
        news.description ||
        news.text ||
        news.content ||
        "Описание отсутствует.";


    const date =
        news.date ||
        news.created ||
        news.published ||
        "";


    const image =
        news.image ||
        "placeholder.webp";


    return `

        <article
            class="news-card"
            data-id="${escapeHTML(id)}"
            data-category="${escapeHTML(category)}"
        >

            ${
                image
                ? `
                    <a
                        href="news-item.html?id=${encodeURIComponent(id)}"
                        class="news-image-link"
                    >

                        <div
                            class="news-image"
                            style="
                                background-image:
                                linear-gradient(
                                    rgba(0,0,0,.15),
                                    rgba(0,0,0,.55)
                                ),
                                url('${escapeHTML(image)}');
                            "
                        >
                        </div>

                    </a>
                `
                : ""
            }


            <div class="news-content">

                ${
                    date
                    ? `
                        <span class="news-date">
                            ${escapeHTML(date)}
                        </span>
                    `
                    : ""
                }


                <span class="news-category">
                    ${escapeHTML(category)}
                </span>


                <h3>
                    ${escapeHTML(title)}
                </h3>


                <p>
                    ${escapeHTML(
                        truncateText(
                            description,
                            220
                        )
                    )}
                </p>


                <a
                    href="news-item.html?id=${encodeURIComponent(id)}"
                    class="news-link"
                >
                    Читать →
                </a>

            </div>

        </article>

    `;

}


/* =====================================================
СЧЁТЧИК НОВОСТЕЙ
===================================================== */

function updateNewsCount(count) {

    const elements =
        document.querySelectorAll(
            "#newsCount, [data-news-count]"
        );


    elements.forEach(element => {

        element.textContent =
            count;

    });

}


/* =====================================================
ОШИБКА БАЗЫ
===================================================== */

function showNewsError() {

    const container =
        document.querySelector(
            ".news-grid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="news-error">

            <div class="news-error-code">
                DATABASE ERROR
            </div>

            <h3>
                НЕ УДАЛОСЬ ЗАГРУЗИТЬ НОВОСТИ
            </h3>

            <p>
                Центральная база данных
                A.S.I.S. временно недоступна.
            </p>

            <button
                class="button primary"
                type="button"
                onclick="location.reload()"
            >
                ПОВТОРИТЬ ЗАПРОС
            </button>

        </div>

    `;

}


/* =====================================================
НОРМАЛИЗАЦИЯ
===================================================== */

function normalize(value) {

    return String(
        value ?? ""
    )
    .trim()
    .toLowerCase()
    .replace(
        /ё/g,
        "е"
    );

}


/* =====================================================
СОКРАЩЕНИЕ ТЕКСТА
===================================================== */

function truncateText(
    text,
    maxLength
) {

    if (!text) {

        return "";

    }


    text =
        String(text);


    if (
        text.length <= maxLength
    ) {

        return text;

    }


    return (
        text
            .substring(
                0,
                maxLength
            )
            .trim()
        + "..."
    );

}


/* =====================================================
ЗАЩИТА HTML
===================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =====================================================
A.S.I.S STATUS
===================================================== */

console.log(
    "%cA.S.I.S.",
    "color:#39D98A;font-size:24px;font-weight:bold"
);

console.log(
    "%cNEWS DATABASE SYSTEM",
    "color:#8A949F;font-size:12px"
);
