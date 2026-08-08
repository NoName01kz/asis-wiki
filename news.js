/*
=====================================================
A.S.I.S.
Archive Survival Information System

news.js
Динамическая страница новостей

Функции:
- загрузка news.json
- главное событие
- список новостей
- поиск
- фильтр по категориям
- сортировка по дате
- счётчик новостей
- ссылки на отдельные новости
- безопасный вывод HTML
=====================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    loadNews();

});


/* =====================================================
ГЛОБАЛЬНЫЕ ДАННЫЕ
===================================================== */

let news = [];

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


        news = await response.json();


        if (!Array.isArray(news)) {

            throw new Error(
                "news.json должен содержать массив новостей"
            );

        }


        console.log(
            "%cA.S.I.S NEWS ONLINE",
            "color:#39D98A;font-size:18px;font-weight:bold"
        );


        console.log(
            `Загружено новостей: ${news.length}`
        );


        updateNewsCounter();

        setupSearch();

        setupFilters();

        renderFeaturedNews();

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
ОБНОВЛЕНИЕ СЧЁТЧИКА НОВОСТЕЙ
===================================================== */

function updateNewsCounter() {

    const ids = [

        "newsCount",
        "totalNews",
        "newsArticles",
        "newsCounter"

    ];


    ids.forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                news.length;

        }

    });


    /*
    Дополнительно поддерживается:

    <span data-news-count></span>
    */

    document
        .querySelectorAll("[data-news-count]")
        .forEach(element => {

            element.textContent =
                news.length;

        });

}


/* =====================================================
ПОИСК
===================================================== */

function setupSearch() {

    const searchInputs = [

        document.querySelector(
            "#newsSearch"
        ),

        document.querySelector(
            ".news-search input"
        ),

        document.querySelector(
            ".archive-search input"
        ),

        document.querySelector(
            'input[type="search"]'
        )

    ];


    /*
    Удаляем повторяющиеся элементы.
    */

    const uniqueInputs =
        [...new Set(
            searchInputs.filter(Boolean)
        )];


    uniqueInputs.forEach(input => {

        input.addEventListener(
            "input",
            event => {

                currentSearch =
                    normalize(
                        event.target.value
                    );


                renderNews();

            }
        );

    });

}


/* =====================================================
ФИЛЬТРЫ КАТЕГОРИЙ
===================================================== */

function setupFilters() {

    const filters =
        document.querySelectorAll(
            ".filter"
        );


    filters.forEach(filter => {

        filter.addEventListener(
            "click",
            () => {

                /*
                Получаем категорию.
                Поддерживаются варианты:

                data-category="Заражённые"

                data-filter="Заражённые"

                data-category="all"
                */

                const category =
                    filter.dataset.category ||
                    filter.dataset.filter ||
                    filter.getAttribute(
                        "data-category"
                    ) ||
                    filter.textContent;


                currentCategory =
                    normalizeCategory(
                        category
                    );


                /*
                Активная кнопка.
                */

                filters.forEach(item => {

                    item.classList.remove(
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
НОРМАЛИЗАЦИЯ КАТЕГОРИИ
===================================================== */

function normalizeCategory(value) {

    const category =
        normalize(value);


    if (
        category === "" ||
        category === "all" ||
        category === "все" ||
        category === "все новости" ||
        category === "все категории"
    ) {

        return "all";

    }


    return category;

}


/* =====================================================
ПОЛУЧЕНИЕ КАТЕГОРИИ НОВОСТИ
===================================================== */

function getNewsCategory(item) {

    return normalize(
        item.category ||
        item.type ||
        "Новости"
    );

}


/* =====================================================
ФИЛЬТРАЦИЯ НОВОСТЕЙ
===================================================== */

function getFilteredNews() {

    return news.filter(item => {

        /*
        -----------------------------
        ФИЛЬТР КАТЕГОРИИ
        -----------------------------
        */

        const category =
            getNewsCategory(item);


        if (
            currentCategory !== "all" &&
            category !== currentCategory
        ) {

            return false;

        }


        /*
        -----------------------------
        ПОИСК
        -----------------------------
        */

        if (currentSearch) {

            const searchableText = [

                item.title,
                item.name,
                item.category,
                item.type,
                item.description,
                item.content,
                item.text,
                item.date

            ]
                .filter(Boolean)
                .join(" ");


            if (
                !normalize(
                    searchableText
                ).includes(
                    currentSearch
                )
            ) {

                return false;

            }

        }


        return true;

    });

}


/* =====================================================
ОСНОВНОЙ СПИСОК НОВОСТЕЙ
===================================================== */

function renderNews() {

    /*
    Ищем основной контейнер.
    Поддерживаются разные варианты.
    */

    const containers = [

        document.querySelector(
            ".news-list"
        ),

        document.querySelector(
            ".news-grid"
        ),

        document.querySelector(
            "#newsList"
        ),

        document.querySelector(
            "#newsGrid"
        )

    ];


    const container =
        containers.find(Boolean);


    if (!container) {

        console.warn(
            "Контейнер новостей не найден."
        );

        return;

    }


    const filteredNews =
        getFilteredNews();


    /*
    Сортируем от новых к старым.
    */

    filteredNews.sort(
        compareNewsDates
    );


    /*
    Если результатов нет.
    */

    if (
        filteredNews.length === 0
    ) {

        container.innerHTML = `

            <div class="archive-empty">

                <h3>
                    НОВОСТИ НЕ НАЙДЕНЫ
                </h3>

                <p>
                    По заданным параметрам
                    новости отсутствуют.
                </p>

            </div>

        `;

        return;

    }


    /*
    Рендерим список.
    */

    container.innerHTML = "";


    filteredNews.forEach(item => {

        container.insertAdjacentHTML(
            "beforeend",
            createNewsCard(item)
        );

    });

}


/* =====================================================
СОЗДАНИЕ КАРТОЧКИ НОВОСТИ
===================================================== */

function createNewsCard(item) {

    const id =
        item.id ||
        "";


    const title =
        item.title ||
        item.name ||
        "Без названия";


    const description =
        item.description ||
        item.content ||
        item.text ||
        "Описание отсутствует.";


    const category =
        item.category ||
        item.type ||
        "Новости";


    const date =
        item.date ||
        "";


    const image =
        item.image ||
        item.cover ||
        "placeholder.webp";


    return `

        <article
            class="news-card"
            data-id="${escapeHTML(id)}"
        >

            ${
                image
                    ? `
                        <a
                            href="news.html?id=${encodeURIComponent(id)}"
                            class="news-image-link"
                        >

                            <div
                                class="news-image"
                                style="
                                    background-image:
                                    linear-gradient(
                                        rgba(0,0,0,.15),
                                        rgba(0,0,0,.45)
                                    ),
                                    url('${escapeHTML(image)}');
                                "
                            ></div>

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
                            180
                        )
                    )}
                </p>


                <a
                    href="news.html?id=${encodeURIComponent(id)}"
                    class="news-link"
                >

                    Читать →

                </a>

            </div>

        </article>

    `;

}


/* =====================================================
ГЛАВНОЕ СОБЫТИЕ
===================================================== */

function renderFeaturedNews() {

    /*
    Ищем контейнер главного события.
    */

    const featuredContainer =
        document.querySelector(
            ".featured-news"
        ) ||
        document.querySelector(
            "#featuredNews"
        ) ||
        document.querySelector(
            ".main-news"
        );


    if (!featuredContainer) {

        console.warn(
            "Контейнер главного события не найден."
        );

        return;

    }


    if (news.length === 0) {

        featuredContainer.innerHTML = `

            <div class="archive-empty">

                <h3>
                    НОВОСТЕЙ НЕТ
                </h3>

            </div>

        `;

        return;

    }


    /*
    =================================================
    ГЛАВНОЕ ИЗМЕНЕНИЕ
    =================================================

    Ищем ТОЛЬКО новость с:

        featured: true

    Например:

        {
            "id": "NEWS-001",
            "title": "Падение сектора",
            "featured": true
        }

    Если таких новостей несколько,
    используется только первая.

    Если ни одной нет —
    берём самую свежую новость
    как запасной вариант.
    */


    let featured =
        news.find(
            item =>
                item.featured === true
        );


    /*
    Поддержка строкового варианта:

        "featured": "true"
    */

    if (!featured) {

        featured =
            news.find(
                item =>
                    String(
                        item.featured
                    ).toLowerCase() === "true"
            );

    }


    /*
    Запасной вариант —
    самая свежая новость.
    */

    if (!featured) {

        featured =
            [...news]
                .sort(
                    compareNewsDates
                )[0];

    }


    featuredContainer.innerHTML =
        createFeaturedNews(
            featured
        );

}


/* =====================================================
КАРТОЧКА ГЛАВНОГО СОБЫТИЯ
===================================================== */

function createFeaturedNews(item) {

    const id =
        item.id ||
        "";


    const title =
        item.title ||
        item.name ||
        "Главное событие";


    const description =
        item.description ||
        item.content ||
        item.text ||
        "";


    const category =
        item.category ||
        item.type ||
        "НОВОСТИ";


    const date =
        item.date ||
        "";


    const image =
        item.image ||
        item.cover ||
        "news.webp";


    return `

        <article
            class="news-card featured"
            data-id="${escapeHTML(id)}"
            style="
                background:
                linear-gradient(
                    rgba(0,0,0,.2),
                    rgba(0,0,0,.85)
                ),
                url('${escapeHTML(image)}');
                background-size:cover;
                background-position:center;
            "
        >

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
                        250
                    )
                )}

            </p>


            <a
                href="news.html?id=${encodeURIComponent(id)}"
            >

                Читать →

            </a>

        </article>

    `;

}


/* =====================================================
СОРТИРОВКА НОВОСТЕЙ ПО ДАТЕ
===================================================== */

function compareNewsDates(a, b) {

    const dateA =
        parseNewsDate(
            a.date
        );


    const dateB =
        parseNewsDate(
            b.date
        );


    return dateB - dateA;

}


/* =====================================================
ПАРСИНГ ДАТЫ
===================================================== */

function parseNewsDate(value) {

    if (!value) {

        return 0;

    }


    const string =
        String(value).trim();


    /*
    Формат:

        08.08.2026

    */

    const russianDate =
        string.match(
            /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
        );


    if (russianDate) {

        const day =
            Number(
                russianDate[1]
            );


        const month =
            Number(
                russianDate[2]
            ) - 1;


        const year =
            Number(
                russianDate[3]
            );


        return new Date(
            year,
            month,
            day
        ).getTime();

    }


    /*
    Обычный ISO-формат:

        2026-08-08
    */

    const parsed =
        Date.parse(string);


    if (!Number.isNaN(parsed)) {

        return parsed;

    }


    return 0;

}


/* =====================================================
ОШИБКА ЗАГРУЗКИ
===================================================== */

function showNewsError() {

    const containers = [

        document.querySelector(
            ".news-list"
        ),

        document.querySelector(
            ".news-grid"
        ),

        document.querySelector(
            "#newsList"
        ),

        document.querySelector(
            "#newsGrid"
        )

    ];


    const container =
        containers.find(Boolean);


    if (container) {

        container.innerHTML = `

            <div class="archive-error">

                <div
                    class="archive-error-code"
                >

                    DATABASE ERROR

                </div>


                <h3>

                    НЕ УДАЛОСЬ ЗАГРУЗИТЬ НОВОСТИ

                </h3>


                <p>

                    Центральная база данных
                    новостей A.S.I.S.
                    временно недоступна.

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


    /*
    Главное событие тоже очищаем.
    */

    const featured =
        document.querySelector(
            ".featured-news"
        ) ||
        document.querySelector(
            "#featuredNews"
        ) ||
        document.querySelector(
            ".main-news"
        );


    if (featured) {

        featured.innerHTML = `

            <div class="archive-error">

                НЕ УДАЛОСЬ ЗАГРУЗИТЬ
                ГЛАВНОЕ СОБЫТИЕ

            </div>

        `;

    }

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
            /\s+/g,
            " "
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
    "%cARCHIVE SURVIVAL INFORMATION SYSTEM",
    "color:#8A949F;font-size:12px"
);
