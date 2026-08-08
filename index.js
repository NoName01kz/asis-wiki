/*
=====================================================
A.S.I.S.
Archive Survival Information System

index.js
Динамическая главная страница

Источник данных:
archive.json
=====================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    loadIndexArchive();

});


/* =====================================================
   ГЛОБАЛЬНЫЕ ДАННЫЕ
===================================================== */

let archive = [];


/* =====================================================
   ЗАГРУЗКА АРХИВА
===================================================== */

async function loadIndexArchive() {

    try {

        const response = await fetch("archive.json", {
            cache: "no-store"
        });


        if (!response.ok) {

            throw new Error(
                `Ошибка загрузки archive.json: ${response.status}`
            );

        }


        archive = await response.json();


        if (!Array.isArray(archive)) {

            throw new Error(
                "archive.json должен содержать массив записей"
            );

        }


        console.log(
            "%cA.S.I.S INDEX ONLINE",
            "color:#39D98A;font-size:18px;font-weight:bold"
        );


        console.log(
            `Загружено записей: ${archive.length}`
        );


        updateStatistics();

        renderPopularArticles();

        renderRandomFile();


    }

    catch (error) {

        console.error(
            "A.S.I.S INDEX DATABASE ERROR:",
            error
        );


        showIndexError();

    }

}


/* =====================================================
   СТАТИСТИКА
===================================================== */

function updateStatistics() {

    /*
    Ищем элементы по возможным ID.

    Можно использовать любой из них:
    archiveCount
    totalCount
    infectedCount
    anomalyCount
    locationCount
    npcCount
    factionCount
    */


    const total =
        archive.length;


    const infected =
        countCategory(
            "Заражённые"
        );


    const anomalies =
        countCategory(
            "Аномалии"
        );


    const locations =
        countCategory(
            "Локации"
        );


    const npcs =
        countCategory(
            "NPC"
        );


    const factions =
        countCategory(
            "Фракции"
        );


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
    Дополнительная поддержка элементов
    с data-stat.
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
                    value = npcs;
                    break;


                case "faction":
                case "factions":
                    value = factions;
                    break;

            }


            element.textContent =
                value;

        });

}


/* =====================================================
   ПОДСЧЁТ КАТЕГОРИИ
===================================================== */

function countCategory(category) {

    const target =
        normalize(category);


    return archive.filter(file => {

        const fileCategory =
            normalize(file.category);


        const fileType =
            normalize(file.type);


        /*
        NPC может храниться так:

        type: NPC
        category: Персонажи

        Поэтому проверяем оба поля.
        */

        if (target === "npc") {

            return (
                fileType === "npc" ||
                fileCategory === "npc" ||
                fileCategory === "персонажи"
            );

        }


        return (
            fileCategory === target
        );

    }).length;

}


/* =====================================================
   ПОПУЛЯРНЫЕ СТАТЬИ
===================================================== */

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
    Выбираем записи для главной страницы.

    Приоритет:
    1. HIGH
    2. EXTREME
    3. CRITICAL
    4. MEDIUM
    5. LOW

    Это позволяет показывать наиболее
    интересные/опасные записи.
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
                        String(a.danger)
                            .toUpperCase()
                    ] || 1;


                const dangerB =
                    dangerWeight[
                        String(b.danger)
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


/* =====================================================
   КАРТОЧКА ПОПУЛЯРНОЙ СТАТЬИ
===================================================== */

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
                        url('${escapeHTML(image)}');
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


/* =====================================================
   СЛУЧАЙНОЕ ДОСЬЕ
===================================================== */

function renderRandomFile() {

    /*
    Поддерживаются разные варианты
    контейнера случайного досье.
    */

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
    Ищем существующие элементы
    внутри random-card.
    */

    const title =
        randomContainer.querySelector(
            ".random-left h2"
        );


    const text =
        randomContainer.querySelector(
            ".random-left p"
        );


    const category =
        randomContainer.querySelector(
            ".random-left span"
        );


    const number =
        randomContainer.querySelector(
            ".archive-number"
        );


    if (title) {

        title.textContent =
            name;

    }


    if (text) {

        text.textContent =
            truncateText(
                description,
                300
            );

    }


    if (category) {

        category.textContent =
            `СЛУЧАЙНОЕ ДОСЬЕ · ${type}`;

    }


    if (number) {

        number.textContent =
            file.id || "A.S.I.S.";

    }


    /*
    Находим кнопку внутри random-card
    и направляем её на выбранное досье.
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
    Если внутри карточки есть изображение,
    обновляем его.

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


/* =====================================================
   УНИВЕРСАЛЬНАЯ УСТАНОВКА СЧЁТЧИКА
===================================================== */

function setCounter(
    ids,
    value
) {

    ids.forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value;

        }

    });

}


/* =====================================================
   ДОПОЛНИТЕЛЬНЫЕ СЧЁТЧИКИ
===================================================== */

function initDataCounters() {

    /*
    Позволяет использовать в HTML:

    <span data-stat="total"></span>

    <span data-stat="infected"></span>

    <span data-stat="anomaly"></span>

    и т.д.
    */


    document
        .querySelectorAll(
            "[data-stat]"
        )
        .forEach(element => {

            const stat =
                normalize(
                    element.dataset.stat
                );


            let value = 0;


            switch (stat) {

                case "total":
                case "all":
                case "archive":

                    value =
                        archive.length;

                    break;


                case "infected":
                case "зараженные":

                    value =
                        countCategory(
                            "Заражённые"
                        );

                    break;


                case "anomaly":
                case "anomalies":
                case "аномалии":

                    value =
                        countCategory(
                            "Аномалии"
                        );

                    break;


                case "location":
                case "locations":
                case "локации":

                    value =
                        countCategory(
                            "Локации"
                        );

                    break;


                case "npc":
                case "npcs":

                    value =
                        countCategory(
                            "NPC"
                        );

                    break;


                case "faction":
                case "factions":

                    value =
                        countCategory(
                            "Фракции"
                        );

                    break;

            }


            element.textContent =
                value;

        });

}


/* =====================================================
   ОШИБКА БАЗЫ
===================================================== */

function showIndexError() {

    /*
    Если статистика есть,
    показываем нули.
    */

    const counters =
        document.querySelectorAll(
            "[data-stat]"
        );


    counters.forEach(
        element => {

            element.textContent =
                "—";

        }
    );


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


/* =====================================================
   НОРМАЛИЗАЦИЯ
===================================================== */

function normalize(value) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

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
