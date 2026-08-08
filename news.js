/*
=========================================================
A.S.I.S.
Archive Survival Information System

news.js
Динамическая страница новостей
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    initNewsPage();

});


/*
=========================================================
ГЛОБАЛЬНЫЕ ДАННЫЕ
=========================================================
*/

let newsArchive = [];

let currentFilter = "all";

let currentSearch = "";


/*
=========================================================
ИНИЦИАЛИЗАЦИЯ
=========================================================
*/

async function initNewsPage() {

    setupNewsFilters();

    setupNewsSearch();

    setupHeaderSearch();

    await loadNewsArchive();

}


/*
=========================================================
ЗАГРУЗКА NEWS.JSON
=========================================================
*/

async function loadNewsArchive() {

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
                "news.json должен содержать массив новостей"
            );

        }


        newsArchive = data;


        console.log(
            "%cA.S.I.S NEWS ONLINE",
            "color:#39D98A;font-size:18px;font-weight:bold"
        );


        console.log(
            `Загружено новостей: ${newsArchive.length}`
        );


        /*
        Сначала обновляем статистику.
        */

        updateNewsStatistics();


        /*
        Затем отображаем новости.
        */

        renderNews();


        /*
        Если URL содержит id,
        открываем конкретную новость.
        */

        openNewsFromURL();


    }

    catch (error) {

        console.error(
            "A.S.I.S NEWS DATABASE ERROR:",
            error
        );


        showNewsError();

    }

}


/*
=========================================================
ФИЛЬТРЫ
=========================================================
*/

function setupNewsFilters() {

    const filters =
        document.querySelectorAll(
            "#newsFilters .filter"
        );


    filters.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filters.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    normalize(
                        button.dataset.filter
                    );


                renderNews();

            }
        );

    });

}


/*
=========================================================
ПОИСК
=========================================================
*/

function setupNewsSearch() {

    const search =
        document.getElementById(
            "newsSearch"
        );


    if (!search) {

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


/*
=========================================================
ПОИСК В HEADER
=========================================================
*/

function setupHeaderSearch() {

    const headerSearch =
        document.getElementById(
            "headerSearch"
        );


    const newsSearch =
        document.getElementById(
            "newsSearch"
        );


    if (
        !headerSearch ||
        !newsSearch
    ) {

        return;

    }


    headerSearch.addEventListener(
        "input",
        event => {

            newsSearch.value =
                event.target.value;


            currentSearch =
                normalize(
                    event.target.value
                );


            renderNews();

        }
    );


    headerSearch.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                newsSearch.focus();

            }

        }
    );

}


/*
=========================================================
ОТОБРАЖЕНИЕ НОВОСТЕЙ
=========================================================
*/

function renderNews() {

    const filteredNews =
        getFilteredNews();


    updateNewsCount(
        filteredNews.length
    );


    /*
    Главное событие.
    */

    renderFeaturedNews(
        filteredNews
    );


    /*
    Основная сетка.
    */

    renderNewsGrid(
        filteredNews
    );


    /*
    Состояние "ничего не найдено".
    */

    const empty =
        document.getElementById(
            "newsEmpty"
        );


    if (empty) {

        empty.style.display =
            filteredNews.length === 0
                ? "block"
                : "none";

    }

}


/*
=========================================================
ФИЛЬТРАЦИЯ
=========================================================
*/

function getFilteredNews() {

    return newsArchive.filter(
        news => {

            /*
            Фильтр категории.
            */

            const category =
                normalize(
                    news.category
                );


            const filterMatches =
                currentFilter === "all" ||
                category === currentFilter;


            if (!filterMatches) {

                return false;

            }


            /*
            Поиск.
            */

            if (!currentSearch) {

                return true;

            }


            const searchableText = [

                news.id,

                news.title,

                news.name,

                news.category,

                news.description,

                news.content,

                news.status,

                news.date

            ]
                .filter(Boolean)
                .join(" ");


            return normalize(
                searchableText
            ).includes(
                currentSearch
            );

        }
    );

}


/*
=========================================================
ГЛАВНАЯ НОВОСТЬ
=========================================================
*/

function renderFeaturedNews(newsList) {

    const container =
        document.getElementById(
            "featuredNews"
        );


    if (!container) {

        return;

    }


    if (newsList.length === 0) {

        container.innerHTML = "";

        return;

    }


    /*
    Берём первую новость.
    news.json должен быть расположен
    от самой новой к старой.
    */

    const news =
        newsList[0];


    container.innerHTML =
        createFeaturedNews(
            news
        );

}


/*
=========================================================
FEATURED CARD
=========================================================
*/

function createFeaturedNews(news) {

    const id =
        news.id || "";


    const title =
        news.title ||
        news.name ||
        "Без названия";


    const date =
        news.date ||
        "Дата неизвестна";


    const category =
        news.category ||
        "НОВОСТЬ";


    const description =
        news.description ||
        "Описание отсутствует.";


    const image =
        news.image ||
        "placeholder.webp";


    return `

        <article
            class="news-card featured"
            style="
                background:
                linear-gradient(
                    rgba(0,0,0,.2),
                    rgba(0,0,0,.85)
                ),
                url('${escapeCSSURL(image)}');
                background-size:cover;
                background-position:center;
            "
        >

            <span class="news-date">

                ${escapeHTML(date)}

            </span>


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
                        300
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


/*
=========================================================
СЕТКА НОВОСТЕЙ
=========================================================
*/

function renderNewsGrid(newsList) {

    const container =
        document.getElementById(
            "newsGrid"
        );


    if (!container) {

        return;

    }


    if (newsList.length === 0) {

        container.innerHTML = "";

        return;

    }


    /*
    Первую новость уже показываем
    в блоке "Главное событие".

    Поэтому в основной сетке
    начинаем со второй.
    */

    const gridNews =
        newsList.slice(1);


    if (gridNews.length === 0) {

        container.innerHTML = `

            <div class="archive-empty">

                <h3>
                    АРХИВ НОВОСТЕЙ
                </h3>

                <p>
                    В базе находится только
                    одна новость.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        gridNews
            .map(
                news =>
                    createNewsCard(
                        news
                    )
            )
            .join("");

}


/*
=========================================================
КАРТОЧКА НОВОСТИ
=========================================================
*/

function createNewsCard(news) {

    const id =
        news.id || "";


    const title =
        news.title ||
        news.name ||
        "Без названия";


    const date =
        news.date ||
        "Дата неизвестна";


    const category =
        news.category ||
        "НОВОСТЬ";


    const description =
        news.description ||
        "Описание отсутствует.";


    const image =
        news.image ||
        "";


    const imageStyle =
        image
            ? `
                background:
                linear-gradient(
                    rgba(57,217,138,.08),
                    rgba(0,0,0,.45)
                ),
                url('${escapeCSSURL(image)}');
                background-size:cover;
                background-position:center;
              `
            : `
                background:
                linear-gradient(
                    rgba(57,217,138,.08),
                    rgba(0,0,0,.45)
                );
              `;


    return `

        <article class="news-card">

            <div
                class="news-card-image"
                style="${imageStyle}"
            >
            </div>


            <div class="news-card-content">

                <span class="news-date">

                    ${escapeHTML(date)}

                </span>


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
                >

                    Читать →

                </a>

            </div>

        </article>

    `;

}


/*
=========================================================
ОТКРЫТИЕ ОТДЕЛЬНОЙ НОВОСТИ
=========================================================
*/

function openNewsFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {

        return;

    }


    const news =
        newsArchive.find(
            item =>
                String(item.id)
                    .toLowerCase() ===
                String(id)
                    .toLowerCase()
        );


    if (!news) {

        showArticleNotFound();

        return;

    }


    renderFullArticle(
        news
    );


    /*
    Скрываем стандартные блоки.
    */

    const hero =
        document.querySelector(
            ".news-hero"
        );


    const control =
        document.querySelector(
            ".archive-control"
        );


    const featured =
        document.querySelector(
            ".news-featured"
        );


    const newsSection =
        document.querySelector(
            ".news"
        );


    const stats =
        document.querySelector(
            ".site-stats"
        );


    if (hero) {

        hero.style.display =
            "none";

    }


    if (control) {

        control.style.display =
            "none";

    }


    if (featured) {

        featured.style.display =
            "none";

    }


    if (newsSection) {

        newsSection.style.display =
            "none";

    }


    if (stats) {

        stats.style.display =
            "none";

    }


    const article =
        document.getElementById(
            "newsArticle"
        );


    if (article) {

        article.style.display =
            "block";

    }

}


/*
=========================================================
ПОЛНАЯ НОВОСТЬ
=========================================================
*/

function renderFullArticle(news) {

    const container =
        document.getElementById(
            "articleContent"
        );


    if (!container) {

        return;

    }


    const title =
        news.title ||
        news.name ||
        "Без названия";


    const date =
        news.date ||
        "Дата неизвестна";


    const category =
        news.category ||
        "НОВОСТЬ";


    const status =
        news.status ||
        "ОПУБЛИКОВАНО";


    const image =
        news.image ||
        "";


    const content =
        news.content ||
        news.description ||
        "Текст новости отсутствует.";


    const paragraphs =
        formatArticleText(
            content
        );


    container.innerHTML = `

        <span class="archive-id">

            ${escapeHTML(
                news.id || "NEWS"
            )}

        </span>


        <div class="news-date">

            ${escapeHTML(date)}

        </div>


        <span class="archive-type">

            ${escapeHTML(category)}

        </span>


        <h1>

            ${escapeHTML(title)}

        </h1>


        ${
            image
                ? `
                    <div
                        class="news-article-image"
                        style="
                            background-image:
                            linear-gradient(
                                rgba(0,0,0,.1),
                                rgba(0,0,0,.35)
                            ),
                            url('${escapeCSSURL(image)}');
                        "
                    >
                    </div>
                  `
                : ""
        }


        <div class="file-status">

            Статус:

            <span>

                ${escapeHTML(status)}

            </span>

        </div>


        <div class="news-article-text">

            ${paragraphs}

        </div>

    `;

}


/*
=========================================================
404 НОВОСТИ
=========================================================
*/

function showArticleNotFound() {

    const container =
        document.getElementById(
            "articleContent"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="archive-error">

            <div class="archive-error-code">

                NEWS 404

            </div>


            <h2>

                НОВОСТЬ НЕ НАЙДЕНА

            </h2>


            <p>

                Запрашиваемая запись отсутствует
                в базе данных A.S.I.S.

            </p>


            <a
                href="news.html"
                class="button primary"
            >

                ВЕРНУТЬСЯ К НОВОСТЯМ

            </a>

        </div>

    `;


    const article =
        document.getElementById(
            "newsArticle"
        );


    if (article) {

        article.style.display =
            "block";

    }

}


/*
=========================================================
СТАТИСТИКА
=========================================================
*/

function updateNewsStatistics() {

    const total =
        newsArchive.length;


    const updates =
        countNewsCategory(
            "ОБНОВЛЕНИЕ"
        );


    const events =
        countNewsCategory(
            "СОБЫТИЕ"
        );


    const anomalies =
        countNewsCategory(
            "АНОМАЛИЯ"
        );


    setCounter(
        "totalNews",
        total
    );


    setCounter(
        "updateNews",
        updates
    );


    setCounter(
        "eventNews",
        events
    );


    setCounter(
        "anomalyNews",
        anomalies
    );

}


/*
=========================================================
ПОДСЧЁТ КАТЕГОРИЙ
=========================================================
*/

function countNewsCategory(category) {

    const target =
        normalize(category);


    return newsArchive.filter(
        news =>
            normalize(
                news.category
            ) === target
    ).length;

}


/*
=========================================================
СЧЁТЧИК
=========================================================
*/

function setCounter(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


/*
=========================================================
СЧЁТЧИК НОВОСТЕЙ
=========================================================
*/

function updateNewsCount(count) {

    const element =
        document.getElementById(
            "newsCount"
        );


    if (!element) {

        return;

    }


    if (count === 1) {

        element.textContent =
            "1 новость";

        return;

    }


    if (
        count >= 2 &&
        count <= 4
    ) {

        element.textContent =
            `${count} новости`;

        return;

    }


    element.textContent =
        `${count} новостей`;

}


/*
=========================================================
ОШИБКА БАЗЫ
=========================================================
*/

function showNewsError() {

    const grid =
        document.getElementById(
            "newsGrid"
        );


    if (grid) {

        grid.innerHTML = `

            <div class="archive-error">

                <div class="archive-error-code">

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


    const featured =
        document.getElementById(
            "featuredNews"
        );


    if (featured) {

        featured.innerHTML = "";

    }


    setCounter(
        "totalNews",
        "—"
    );


    setCounter(
        "updateNews",
        "—"
    );


    setCounter(
        "eventNews",
        "—"
    );


    setCounter(
        "anomalyNews",
        "—"
    );


    updateNewsCount(0);

}


/*
=========================================================
НОРМАЛИЗАЦИЯ
=========================================================
*/

function normalize(value) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}


/*
=========================================================
СОКРАЩЕНИЕ ТЕКСТА
=========================================================
*/

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


/*
=========================================================
ФОРМАТИРОВАНИЕ ПОЛНОГО ТЕКСТА
=========================================================
*/

function formatArticleText(
    text
) {

    if (!text) {

        return `
            <p>
                Текст новости отсутствует.
            </p>
        `;

    }


    /*
    Если content содержит
    несколько абзацев через пустую строку,
    превращаем их в отдельные <p>.
    */

    return String(text)
        .split(/\n\s*\n/)
        .map(
            paragraph => {

                const clean =
                    paragraph.trim();


                if (!clean) {

                    return "";

                }


                return `
                    <p>
                        ${escapeHTML(clean)}
                    </p>
                `;

            }
        )
        .join("");

}


/*
=========================================================
ЗАЩИТА HTML
=========================================================
*/

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


/*
=========================================================
ЗАЩИТА URL ИЗОБРАЖЕНИЯ
=========================================================
*/

function escapeCSSURL(value) {

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
            /\)/g,
            "\\)"
        )
        .replace(
            /\(/g,
            "\\("
        );

}


/*
=========================================================
A.S.I.S STATUS
=========================================================
*/

console.log(
    "%cA.S.I.S.",
    "color:#39D98A;font-size:24px;font-weight:bold"
);


console.log(
    "%cNEWS DATABASE SYSTEM",
    "color:#8A949F;font-size:12px"
);
