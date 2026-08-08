/*
=========================================================
A.S.I.S.
Archive Survival Information System

news.js
Динамическая система новостей

Работает с:

news.html
news.json

Поддерживает:

- поиск
- категории
- статистику
- главное событие
- последние новости
- отсутствие результатов
- два поля поиска
- featured:true
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    initNews();

});


/* =====================================================
   ГЛОБАЛЬНЫЕ ДАННЫЕ
===================================================== */

let newsArchive = [];

let currentCategory = "all";

let currentSearch = "";


/* =====================================================
   ЗАПУСК
===================================================== */

async function initNews() {

    console.log(
        "%cA.S.I.S. NEWS SYSTEM ONLINE",
        "color:#39D98A;font-size:18px;font-weight:bold;"
    );


    setupSearch();

    setupFilters();

    await loadNews();

}


/* =====================================================
   ЗАГРУЗКА NEWS.JSON
===================================================== */

async function loadNews() {

    try {

        const response = await fetch(
            "news.json",
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                `Ошибка загрузки news.json: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "news.json должен содержать массив новостей."
            );

        }


        /*
        Удаляем записи без ID.
        */

        newsArchive =
            data.filter(news =>
                news &&
                news.id
            );


        /*
        Удаляем дубли по ID.
        */

        newsArchive =
            removeDuplicateNews(
                newsArchive
            );


        /*
        Сортируем от новых к старым.
        */

        newsArchive.sort(
            sortByDate
        );


        console.log(
            `Загружено новостей: ${newsArchive.length}`
        );


        updateStatistics();

        renderFeaturedNews();

        renderNews();


    }
    catch (error) {

        console.error(
            "A.S.I.S. NEWS DATABASE ERROR:",
            error
        );


        showNewsError();

    }

}


/* =====================================================
   УДАЛЕНИЕ ДУБЛИКАТОВ
===================================================== */

function removeDuplicateNews(news) {

    const usedIds =
        new Set();


    return news.filter(item => {

        const id =
            String(item.id)
                .trim();


        if (!id) {

            return false;

        }


        if (usedIds.has(id)) {

            console.warn(
                `Дубликат новости удалён: ${id}`
            );

            return false;

        }


        usedIds.add(id);

        return true;

    });

}


/* =====================================================
   СОРТИРОВКА ПО ДАТЕ
===================================================== */

function sortByDate(a, b) {

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
   ПРЕОБРАЗОВАНИЕ ДАТЫ
===================================================== */

function parseNewsDate(date) {

    if (!date) {

        return 0;

    }


    const value =
        String(date)
            .trim();


    /*
    Формат:

    08.08.2026
    */

    const parts =
        value.split(".");


    if (parts.length === 3) {

        const day =
            Number(parts[0]);


        const month =
            Number(parts[1]);


        const year =
            Number(parts[2]);


        if (
            !Number.isNaN(day) &&
            !Number.isNaN(month) &&
            !Number.isNaN(year)
        ) {

            return new Date(
                year,
                month - 1,
                day
            ).getTime();

        }

    }


    /*
    Если дата другого формата.
    */

    const timestamp =
        Date.parse(value);


    return Number.isNaN(timestamp)
        ? 0
        : timestamp;

}


/* =====================================================
   ПОИСК
===================================================== */

function setupSearch() {

    const searchInputs =
        document.querySelectorAll(
            "#newsSearch, #newsSearchMain"
        );


    if (!searchInputs.length) {

        return;

    }


    searchInputs.forEach(input => {

        input.addEventListener(
            "input",
            event => {

                currentSearch =
                    normalize(
                        event.target.value
                    );


                /*
                Синхронизируем оба
                поля поиска.
                */

                searchInputs.forEach(
                    otherInput => {

                        if (
                            otherInput !==
                            event.target
                        ) {

                            otherInput.value =
                                event.target.value;

                        }

                    }
                );


                renderNews();

            }
        );

    });

}


/* =====================================================
   ФИЛЬТРЫ
===================================================== */

function setupFilters() {

    const filters =
        document.querySelectorAll(
            "#newsFilters .filter"
        );


    if (!filters.length) {

        return;

    }


    filters.forEach(filter => {

        filter.addEventListener(
            "click",
            () => {

                currentCategory =
                    normalize(
                        filter.dataset.category ||
                        "all"
                    );


                /*
                Переключаем active.
                */

                filters.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                filter.classList.add(
                    "active"
                );


                renderNews();

            }
        );

    });

}


/* =====================================================
   ФИЛЬТРАЦИЯ
===================================================== */

function getFilteredNews() {

    return newsArchive.filter(
        news => {

            const category =
                normalize(
                    news.category
                );


            const title =
                normalize(
                    news.title
                );


            const description =
                normalize(
                    news.description
                );


            const content =
                normalize(
                    news.content
                );


            const id =
                normalize(
                    news.id
                );


            /*
            Проверка категории.
            */

            const categoryMatch =
                currentCategory === "all" ||
                category === currentCategory;


            if (!categoryMatch) {

                return false;

            }


            /*
            Если поиска нет —
            запись подходит.
            */

            if (!currentSearch) {

                return true;

            }


            /*
            Ищем по:

            title
            category
            description
            content
            id
            */

            return (

                title.includes(
                    currentSearch
                )

                ||

                category.includes(
                    currentSearch
                )

                ||

                description.includes(
                    currentSearch
                )

                ||

                content.includes(
                    currentSearch
                )

                ||

                id.includes(
                    currentSearch
                )

            );

        }
    );

}


/* =====================================================
   ГЛАВНОЕ СОБЫТИЕ
===================================================== */

function renderFeaturedNews() {

    const container =
        document.getElementById(
            "featuredNews"
        );


    if (!container) {

        console.warn(
            "Элемент #featuredNews не найден."
        );

        return;

    }


    /*
    Ищем только featured:true.
    */

    const featuredNews =
        newsArchive.find(
            news =>
                news.featured === true
        );


    /*
    Если главное событие
    не назначено.
    */

    if (!featuredNews) {

        container.innerHTML = `

            <article class="news-card">

                <span class="news-date">
                    A.S.I.S.
                </span>

                <h3>
                    Главное событие не назначено
                </h3>

                <p>
                    В news.json пока нет записи
                    с параметром "featured": true.
                </p>

            </article>

        `;

        return;

    }


    container.innerHTML =
        createFeaturedCard(
            featuredNews
        );

}


/* =====================================================
   КАРТОЧКА ГЛАВНОГО СОБЫТИЯ
===================================================== */

function createFeaturedCard(news) {

    const id =
        escapeHTML(
            news.id
        );


    const title =
        escapeHTML(
            news.title ||
            "Без названия"
        );


    const date =
        escapeHTML(
            news.date ||
            ""
        );


    const category =
        escapeHTML(
            news.category ||
            "Новости"
        );


    const description =
        escapeHTML(
            news.description ||
            "Описание отсутствует."
        );


    const image =
        escapeCSSUrl(
            news.image ||
            "news.webp"
        );


    return `

        <article
            class="news-card featured"
            style="
                background:
                linear-gradient(
                    rgba(0,0,0,.2),
                    rgba(0,0,0,.85)
                ),
                url('${image}');
                background-size:cover;
                background-position:center;
            "
        >

            <span class="news-date">
                ${date}
            </span>


            <h3>
                ${title}
            </h3>


            <p>
                ${description}
            </p>


            <a
                href="news-article.html?id=${encodeURIComponent(
                    news.id
                )}"
            >
                Читать →
            </a>

        </article>

    `;

}


/* =====================================================
   ПОСЛЕДНИЕ НОВОСТИ
===================================================== */

function renderNews() {

    const container =
        document.getElementById(
            "newsGrid"
        );


    if (!container) {

        console.warn(
            "Элемент #newsGrid не найден."
        );

        return;

    }


    const filteredNews =
        getFilteredNews();


    /*
    Обновляем количество
    результатов.
    */

    updateResultsCount(
        filteredNews.length
    );


    /*
    Показываем / скрываем
    блок NO RESULTS.
    */

    updateNoResults(
        filteredNews.length
    );


    /*
    Если ничего нет.
    */

    if (
        filteredNews.length === 0
    ) {

        container.innerHTML = "";

        return;

    }


    /*
    Строим карточки.
    */

    container.innerHTML =
        filteredNews
            .map(
                createNewsCard
            )
            .join("");

}


/* =====================================================
   КАРТОЧКА НОВОСТИ
===================================================== */

function createNewsCard(news) {

    const id =
        escapeHTML(
            news.id ||
            ""
        );


    const title =
        escapeHTML(
            news.title ||
            "Без названия"
        );


    const date =
        escapeHTML(
            news.date ||
            ""
        );


    const category =
        escapeHTML(
            news.category ||
            "Новости"
        );


    const description =
        escapeHTML(
            news.description ||
            "Описание отсутствует."
        );


    const image =
        escapeCSSUrl(
            news.image ||
            "news.webp"
        );


    const status =
        escapeHTML(
            news.status ||
            "ОПУБЛИКОВАНО"
        );


    return `

        <article
            class="archive-card news-card"
            data-id="${id}"
            data-category="${category}"
        >

            <div
                class="popular-image"
                style="
                    background:
                    linear-gradient(
                        rgba(57,217,138,.08),
                        rgba(0,0,0,.35)
                    ),
                    url('${image}');
                    background-size:cover;
                    background-position:center;
                "
            >
            </div>


            <div
                class="archive-id"
                style="margin-top:20px;"
            >
                ${id}
            </div>


            <span class="archive-type">
                ${category}
            </span>


            <div
                class="news-date"
                style="margin-top:5px;"
            >
                ${date}
            </div>


            <h3>
                ${title}
            </h3>


            <p>
                ${description}
            </p>


            <div
                style="
                    color:var(--text-light);
                    font-size:12px;
                    margin-bottom:18px;
                "
            >
                ${status}
            </div>


            <a
                href="news-article.html?id=${encodeURIComponent(
                    news.id
                )}"
                class="section-link"
            >
                Читать →
            </a>

        </article>

    `;

}


/* =====================================================
   СТАТИСТИКА
===================================================== */

function updateStatistics() {

    const total =
        newsArchive.length;


    const updates =
        countCategory(
            "Обновления"
        );


    const events =
        countCategory(
            "События"
        );


    const archiveNews =
        countCategory(
            "Архив"
        );


    /*
    Основной счётчик.
    */

    setCounter(
        "newsCount",
        total
    );


    /*
    Обновления.
    */

    setCounter(
        "updateCount",
        updates
    );


    /*
    События.
    */

    setCounter(
        "eventCount",
        events
    );


    /*
    Архив.
    */

    setCounter(
        "archiveNewsCount",
        archiveNews
    );


    /*
    Поддержка data-stat
    на будущее.
    */

    document
        .querySelectorAll(
            "[data-stat]"
        )
        .forEach(
            element => {

                const stat =
                    normalize(
                        element.dataset.stat
                    );


                let value = 0;


                switch (stat) {

                    case "total":
                    case "news":
                    case "all":

                        value =
                            total;

                        break;


                    case "updates":
                    case "update":
                    case "обновления":

                        value =
                            updates;

                        break;


                    case "events":
                    case "event":
                    case "события":

                        value =
                            events;

                        break;


                    case "archive":
                    case "архив":

                        value =
                            archiveNews;

                        break;

                }


                element.textContent =
                    value;

            }
        );

}


/* =====================================================
   ПОДСЧЁТ КАТЕГОРИИ
===================================================== */

function countCategory(category) {

    const target =
        normalize(
            category
        );


    return newsArchive.filter(
        news => {

            return (
                normalize(
                    news.category
                ) === target
            );

        }
    ).length;

}


/* =====================================================
   СЧЁТЧИК
===================================================== */

function setCounter(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =
        value;

}


/* =====================================================
   РЕЗУЛЬТАТЫ ПОИСКА
===================================================== */

function updateResultsCount(
    count
) {

    const element =
        document.getElementById(
            "newsResultsCount"
        );


    if (!element) {

        return;

    }


    element.textContent =
        `Найдено: ${count}`;

}


/* =====================================================
   NO RESULTS
===================================================== */

function updateNoResults(
    count
) {

    /*
    Если добавишь:

    id="newsNoResults"

    JS автоматически
    начнёт им управлять.
    */

    const element =
        document.getElementById(
            "newsNoResults"
        );


    if (!element) {

        return;

    }


    element.style.display =
        count === 0
            ? "block"
            : "none";

}


/* =====================================================
   ОШИБКА БАЗЫ
===================================================== */

function showNewsError() {

    setCounter(
        "newsCount",
        "—"
    );


    setCounter(
        "updateCount",
        "—"
    );


    setCounter(
        "eventCount",
        "—"
    );


    setCounter(
        "archiveNewsCount",
        "—"
    );


    const grid =
        document.getElementById(
            "newsGrid"
        );


    if (grid) {

        grid.innerHTML = `

            <div class="archive-panel glass">

                <div class="archive-error-code">
                    DATABASE ERROR
                </div>


                <h2>
                    Не удалось загрузить новости
                </h2>


                <p
                    style="
                        color:var(--text-light);
                        margin-top:15px;
                        line-height:1.8;
                    "
                >
                    Центральная база новостей
                    A.S.I.S. временно недоступна.
                </p>


                <button
                    class="button primary"
                    type="button"
                    onclick="location.reload()"
                    style="margin-top:25px;"
                >
                    Повторить запрос
                </button>

            </div>

        `;

    }


    const featured =
        document.getElementById(
            "featuredNews"
        );


    if (featured) {

        featured.innerHTML = "";

    }


    const results =
        document.getElementById(
            "newsResultsCount"
        );


    if (results) {

        results.textContent =
            "Ошибка базы данных";

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
        .toLowerCase();

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
   ЗАЩИТА URL ИЗОБРАЖЕНИЯ
===================================================== */

function escapeCSSUrl(value) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        );

}


/* =====================================================
   A.S.I.S. CONSOLE
===================================================== */

console.log(
    "%cA.S.I.S.",
    "color:#39D98A;font-size:24px;font-weight:bold;"
);


console.log(
    "%cNEWS DATABASE SYSTEM",
    "color:#8A949F;font-size:12px;"
);
