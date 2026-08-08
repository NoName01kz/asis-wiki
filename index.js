/*
===========================================================
A.S.I.S.
Archive Survival Information System

index.js
Динамическая главная страница

Подключает:

archive.json
    ↓
статистика
популярные статьи
случайное досье

news.json
    ↓
последние новости
===========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    loadIndexData();

});


/* =========================================================
   ГЛОБАЛЬНЫЕ ДАННЫЕ
========================================================= */

let archive = [];
let news = [];


/* =========================================================
   ЗАГРУЗКА ВСЕХ ДАННЫХ
========================================================= */

async function loadIndexData() {

    try {

        /*
        Загружаем архив и новости одновременно.
        */

        const [archiveResponse, newsResponse] =
            await Promise.all([
                fetch("archive.json", {
                    cache: "no-store"
                }),

                fetch("news.json", {
                    cache: "no-store"
                })
            ]);


        /* =================================================
           ARCHIVE.JSON
        ================================================= */

        if (!archiveResponse.ok) {

            throw new Error(
                `Ошибка загрузки archive.json: ${archiveResponse.status}`
            );

        }


        archive = await archiveResponse.json();


        if (!Array.isArray(archive)) {

            throw new Error(
                "archive.json должен содержать массив записей"
            );

        }


        /* =================================================
           NEWS.JSON
        ================================================= */

        if (newsResponse.ok) {

            news = await newsResponse.json();


            if (!Array.isArray(news)) {

                console.warn(
                    "news.json должен содержать массив записей"
                );

                news = [];

            }

        } else {

            console.warn(
                `news.json недоступен: ${newsResponse.status}`
            );

            news = [];

        }


        /* =================================================
           СТАТУС
        ================================================= */

        console.log(
            "%cA.S.I.S INDEX ONLINE",
            "color:#39D98A;font-size:18px;font-weight:bold"
        );


        console.log(
            `Загружено записей архива: ${archive.length}`
        );


        console.log(
            `Загружено новостей: ${news.length}`
        );


        /* =================================================
           ОБНОВЛЕНИЕ ГЛАВНОЙ
        ================================================= */

        updateStatistics();

        renderPopularArticles();

        renderRandomFile();

        renderLatestNews();


    }

    catch (error) {

        console.error(
            "A.S.I.S INDEX DATABASE ERROR:",
            error
        );


        showIndexError();

    }

}


/* =========================================================
   СТАТИСТИКА
========================================================= */

function updateStatistics() {

    const total =
        archive.length;


    const infected =
        countCategory("Заражённые");


    const anomalies =
        countCategory("Аномалии");


    const locations =
        countCategory("Локации");


    const npcs =
        countCategory("NPC");


    const factions =
        countCategory("Фракции");


    /*
    Основные ID.
    */

    setCounter(
        [
            "archiveCount",
            "totalCount",
            "totalArticles"
        ],
        total
    );


    setCounter(
        [
            "infectedCount",
            "infectedArticles"
        ],
        infected
    );


    setCounter(
        [
            "anomalyCount",
            "anomaliesCount",
            "anomalyArticles"
        ],
        anomalies
    );


    setCounter(
        [
            "locationCount",
            "locationsCount",
            "locationArticles"
        ],
        locations
    );


    setCounter(
        [
            "npcCount",
            "npcsCount",
            "npcArticles"
        ],
        npcs
    );


    setCounter(
        [
            "factionCount",
            "factionsCount",
            "factionArticles"
        ],
        factions
    );


    /*
    Поддержка data-stat.
    Например:

    <span data-stat="total"></span>
    <span data-stat="infected"></span>
    */

    document
        .querySelectorAll("[data-stat]")
        .forEach(element => {

            const stat =
                normalize(
                    element.dataset.stat
                );


            let value = 0;


            switch (stat) {

                case "all":
                case "total":
                case "archive":

                    value = total;

                    break;


                case "infected":
                case "зараженные":

                    value = infected;

                    break;


                case "anomaly":
                case "anomalies":
                case "аномалии":

                    value = anomalies;

                    break;


                case "location":
                case "locations":
                case "локации":

                    value = locations;

                    break;


                case "npc":
                case "npcs":
                case "персонажи":

                    value = npcs;

                    break;


                case "faction":
                case "factions":
                case "фракции":

                    value = factions;

                    break;

            }


            element.textContent =
                value;

        });

}


/* =========================================================
   ПОДСЧЁТ КАТЕГОРИИ
========================================================= */

function countCategory(category) {

    const target =
        normalize(category);


    return archive.filter(file => {

        const fileCategory =
            normalize(file.category);


        const fileType =
            normalize(file.type);


        /*
        NPC:

        type: NPC
        category: Персонажи
        */

        if (target === "npc") {

            return (
                fileType === "npc" ||
                fileCategory === "npc" ||
                fileCategory === "персонажи"
            );

        }


        /*
        Фракции также проверяем по type.
        */

        if (target === "фракции") {

            return (
                fileCategory === "фракции" ||
                fileType === "фракция"
            );

        }


        /*
        Остальные категории.
        */

        return (
            fileCategory === target ||
            fileType === target
        );

    }).length;

}


/* =========================================================
   УСТАНОВКА СЧЁТЧИКОВ
========================================================= */

function setCounter(ids, value) {

    ids.forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value;

        }

    });

}


/* =========================================================
   ПОПУЛЯРНЫЕ СТАТЬИ
========================================================= */

function renderPopularArticles() {

    const container =
        document.querySelector(
            ".popular-grid"
        );


    if (!container) {

        console.warn(
            "Элемент .popular-grid не найден"
        );

        return;

    }


    if (archive.length === 0) {

        container.innerHTML = `

            <div class="archive-empty">

                <h3>
                    АРХИВ ПУСТ
                </h3>

                <p>
                    В базе данных отсутствуют записи.
                </p>

            </div>

        `;

        return;

    }


    /*
    Приоритет опасности.

    Чем выше danger —
    тем выше статья в популярных.
    */

    const dangerWeight = {

        EXTREME: 5,
        CRITICAL: 5,
        HIGH: 4,
        MEDIUM: 3,
        LOW: 2

    };


    const popular =
        [...archive]
            .sort((a, b) => {

                const dangerA =
                    dangerWeight[
                        String(a.danger || "")
                            .toUpperCase()
                    ] || 1;


                const dangerB =
                    dangerWeight[
                        String(b.danger || "")
                            .toUpperCase()
                    ] || 1;


                return dangerB - dangerA;

            })
            .slice(0, 3);


    container.innerHTML = "";


    popular.forEach(file => {

        container.insertAdjacentHTML(
            "beforeend",
            createPopularCard(file)
        );

    });

}


/* =========================================================
   КАРТОЧКА ПОПУЛЯРНОЙ СТАТЬИ
========================================================= */

function createPopularCard(file) {

    const image =
        file.image ||
        "placeholder.webp";


    const name =
        file.name ||
        "Без названия";


    const category =
        file.category ||
        file.type ||
        "АРХИВ";


    const description =
        file.description ||
        "Описание отсутствует.";


    const id =
        file.id ||
        "";


    return `

        <article
            class="popular-card"
            data-id="${escapeHTML(id)}"
        >

            <a
                href="file.html?id=${encodeURIComponent(id)}"
                aria-label="Открыть досье ${escapeHTML(name)}"
            >

                <div
                    class="popular-image"
                    style="
                        background-image:
                        linear-gradient(
                            rgba(57,217,138,.08),
                            rgba(0,0,0,.3)
                        ),
                        url('${escapeCSSURL(image)}');
                    "
                >
                </div>

            </a>


            <div class="popular-content">

                <span>
                    ${escapeHTML(category)}
                </span>


                <h3>
                    ${escapeHTML(name)}
                </h3>


                <p>
                    ${escapeHTML(
                        truncateText(
                            description,
                            170
                        )
                    )}
                </p>


                <a
                    href="file.html?id=${encodeURIComponent(id)}"
                >
                    ОТКРЫТЬ ДОСЬЕ →
                </a>

            </div>

        </article>

    `;

}


/* =========================================================
   СЛУЧАЙНОЕ ДОСЬЕ
========================================================= */

function renderRandomFile() {

    const randomContainer =
        document.querySelector(
            ".random-card"
        );


    if (!randomContainer) {

        console.warn(
            "Элемент .random-card не найден"
        );

        return;

    }


    if (archive.length === 0) {

        return;

    }


    /*
    Выбираем случайную запись.
    */

    const file =
        archive[
            Math.floor(
                Math.random() *
                archive.length
            )
        ];


    const id =
        file.id ||
        "";


    const name =
        file.name ||
        "Без названия";


    const description =
        file.description ||
        "Описание отсутствует.";


    const type =
        file.type ||
        "Архив";


    /*
    Заголовок.
    */

    const title =
        randomContainer.querySelector(
            ".random-left h2"
        );


    if (title) {

        title.textContent =
            name;

    }


    /*
    Описание.
    */

    const text =
        randomContainer.querySelector(
            ".random-left p"
        );


    if (text) {

        text.textContent =
            truncateText(
                description,
                300
            );

    }


    /*
    Категория.
    */

    const category =
        randomContainer.querySelector(
            ".random-left span"
        );


    if (category) {

        category.textContent =
            `СЛУЧАЙНОЕ ДОСЬЕ · ${type}`;

    }


    /*
    Номер архива.
    */

    const number =
        randomContainer.querySelector(
            ".archive-number"
        );


    if (number) {

        number.textContent =
            id || "A.S.I.S.";

    }


    /*
    Кнопка.
    */

    const button =
        randomContainer.querySelector(
            "a.button"
        );


    if (button) {

        button.href =
            `file.html?id=${encodeURIComponent(id)}`;

    }


    /*
    Если есть изображение.
    */

    const image =
        randomContainer.querySelector(
            "img"
        );


    if (image && file.image) {

        image.src =
            file.image;


        image.alt =
            name;

    }

}


/* =========================================================
   ПОСЛЕДНИЕ НОВОСТИ
========================================================= */

function renderLatestNews() {

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


    /*
    Если news.json пустой.
    */

    if (news.length === 0) {

        container.innerHTML = `

            <div class="archive-empty">

                <h3>
                    НОВОСТЕЙ ПОКА НЕТ
                </h3>

                <p>
                    Новостная база A.S.I.S.
                    пока не содержит публикаций.
                </p>

            </div>

        `;

        return;

    }


    /*
    Сортировка по дате.
    */

    const sortedNews =
        [...news]
            .sort((a, b) => {

                const dateA =
                    parseNewsDate(
                        a.date
                    );


                const dateB =
                    parseNewsDate(
                        b.date
                    );


                return dateB - dateA;

            })
            .slice(0, 3);


    container.innerHTML = "";


    sortedNews.forEach(
        (item, index) => {

            container.insertAdjacentHTML(
                "beforeend",
                createNewsCard(
                    item,
                    index === 0
                )
            );

        }
    );

}


/* =========================================================
   СОЗДАНИЕ НОВОСТИ
========================================================= */

function createNewsCard(
    item,
    featured = false
) {

    const title =
        item.title ||
        item.name ||
        "Без названия";


    const description =
        item.description ||
        item.text ||
        "Описание отсутствует.";


    const date =
        item.date ||
        "";


    const id =
        item.id ||
        "";


    const image =
        item.image ||
        "";


    /*
    Ссылка на конкретную новость.

    Если у новости есть link —
    используем его.

    Иначе:
    news.html?id=...
    */

    const link =
        item.link ||
        (
            id
                ? `news.html?id=${encodeURIComponent(id)}`
                : "news.html"
        );


    /*
    Для первой новости
    добавляем featured.
    */

    const classes =
        featured
            ? "news-card featured"
            : "news-card";


    /*
    Если у новости есть изображение,
    первая карточка получает его как фон.
    */

    let style = "";


    if (featured && image) {

        style = `

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

        `;

    }


    return `

        <article
            class="${classes}"
            ${style}
        >

            <span class="news-date">

                ${escapeHTML(
                    formatNewsDate(date)
                )}

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


            <a href="${escapeHTML(link)}">

                Читать →

            </a>

        </article>

    `;

}


/* =========================================================
   РАЗБОР ДАТЫ НОВОСТИ
========================================================= */

function parseNewsDate(date) {

    if (!date) {

        return 0;

    }


    /*
    YYYY-MM-DD
    */

    const parsed =
        Date.parse(
            String(date)
        );


    if (!Number.isNaN(parsed)) {

        return parsed;

    }


    /*
    DD.MM.YYYY
    */

    const parts =
        String(date).split(".");


    if (parts.length === 3) {

        const day =
            Number(parts[0]);


        const month =
            Number(parts[1]) - 1;


        const year =
            Number(parts[2]);


        return new Date(
            year,
            month,
            day
        ).getTime();

    }


    return 0;

}


/* =========================================================
   ФОРМАТИРОВАНИЕ ДАТЫ
========================================================= */

function formatNewsDate(date) {

    if (!date) {

        return "";

    }


    /*
    Если уже DD.MM.YYYY —
    оставляем как есть.
    */

    if (
        /^\d{2}\.\d{2}\.\d{4}$/
            .test(
                String(date)
            )
    ) {

        return date;

    }


    const parsed =
        parseNewsDate(date);


    if (!parsed) {

        return String(date);

    }


    const d =
        new Date(parsed);


    const day =
        String(
            d.getDate()
        ).padStart(
            2,
            "0"
        );


    const month =
        String(
            d.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const year =
        d.getFullYear();


    return `${day}.${month}.${year}`;

}


/* =========================================================
   ОШИБКА БАЗЫ
========================================================= */

function showIndexError() {

    /*
    Счётчики.
    */

    document
        .querySelectorAll(
            "[data-stat]"
        )
        .forEach(element => {

            element.textContent =
                "—";

        });


    /*
    Также сбрасываем основные ID.
    */

    [
        "archiveCount",
        "totalCount",
        "totalArticles",
        "infectedCount",
        "infectedArticles",
        "anomalyCount",
        "anomaliesCount",
        "anomalyArticles",
        "locationCount",
        "locationsCount",
        "locationArticles",
        "npcCount",
        "npcsCount",
        "npcArticles",
        "factionCount",
        "factionsCount",
        "factionArticles"
    ]
        .forEach(id => {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent =
                    "—";

            }

        });


    /*
    Популярные статьи.
    */

    const popular =
        document.querySelector(
            ".popular-grid"
        );


    if (popular) {

        popular.innerHTML = `

            <div class="archive-error">

                <div class="archive-error-code">

                    DATABASE ERROR

                </div>


                <h3>

                    НЕ УДАЛОСЬ ЗАГРУЗИТЬ АРХИВ

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

}


/* =========================================================
   НОРМАЛИЗАЦИЯ
========================================================= */

function normalize(value) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   СОКРАЩЕНИЕ ТЕКСТА
========================================================= */

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


/* =========================================================
   ЗАЩИТА HTML
========================================================= */

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


/* =========================================================
   ЗАЩИТА URL ДЛЯ CSS
========================================================= */

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
            /"/g,
            '\\"'
        );

}


/* =========================================================
   A.S.I.S STATUS
========================================================= */

console.log(
    "%cA.S.I.S.",
    "color:#39D98A;font-size:24px;font-weight:bold"
);


console.log(
    "%cARCHIVE SURVIVAL INFORMATION SYSTEM",
    "color:#8A949F;font-size:12px"
);
