/*
=========================================================
A.S.I.S.
Archive Survival Information System

index.js
Динамическая главная страница
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {
    loadIndexArchive();
});


/*
=========================================================
ГЛОБАЛЬНЫЕ ДАННЫЕ
=========================================================
*/

let archive = [];


/*
=========================================================
ЗАГРУЗКА АРХИВА
=========================================================
*/

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


        /*
        Обновляем главную страницу
        */

        updateStatistics();

        renderPopularArticles();

        renderRandomFile();

    } catch (error) {

        console.error(
            "A.S.I.S INDEX DATABASE ERROR:",
            error
        );

        showIndexError();

    }

}


/*
=========================================================
СТАТИСТИКА
=========================================================
*/

function updateStatistics() {

    const total = archive.length;

    const infected = countCategory("Заражённые");

    const anomalies = countCategory("Аномалии");

    const locations = countCategory("Локации");

    const npcs = countCategory("NPC");

    const factions = countCategory("Фракции");


    /*
    Общее количество
    */

    setCounter(
        [
            "archiveCount",
            "totalCount",
            "totalArticles"
        ],
        total
    );


    /*
    Заражённые
    */

    setCounter(
        [
            "infectedCount",
            "infectedArticles"
        ],
        infected
    );


    /*
    Аномалии
    */

    setCounter(
        [
            "anomalyCount",
            "anomaliesCount",
            "anomalyArticles"
        ],
        anomalies
    );


    /*
    Локации
    */

    setCounter(
        [
            "locationCount",
            "locationsCount",
            "locationArticles"
        ],
        locations
    );


    /*
    NPC
    */

    setCounter(
        [
            "npcCount",
            "npcsCount",
            "npcArticles"
        ],
        npcs
    );


    /*
    Фракции
    */

    setCounter(
        [
            "factionCount",
            "factionsCount",
            "factionArticles"
        ],
        factions
    );


    /*
    Поддержка data-stat
    */

    updateDataStats();

}


/*
=========================================================
ПОДСЧЁТ КАТЕГОРИИ
=========================================================
*/

function countCategory(category) {

    const target = normalize(category);


    return archive.filter(file => {

        const fileCategory =
            normalize(file.category);

        const fileType =
            normalize(file.type);


        /*
        NPC может быть записан
        либо в type, либо в category.
        */

        if (target === "npc") {

            return (
                fileType === "npc" ||
                fileCategory === "npc" ||
                fileCategory === "персонажи"
            );

        }


        return fileCategory === target;

    }).length;

}


/*
=========================================================
DATA-STAT
=========================================================

Поддерживаются:

data-stat="total"
data-stat="infected"
data-stat="anomaly"
data-stat="location"
data-stat="npc"
data-stat="faction"
=========================================================
*/

function updateDataStats() {

    document
        .querySelectorAll("[data-stat]")
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

                    value = archive.length;

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


                default:

                    value = 0;

            }


            element.textContent = value;

        });

}


/*
=========================================================
ПОПУЛЯРНЫЕ СТАТЬИ
=========================================================
*/

function renderPopularArticles() {

    const container =
        document.querySelector(
            ".popular-grid"
        );


    if (!container) {

        console.warn(
            "A.S.I.S: .popular-grid не найден"
        );

        return;

    }


    /*
    Если архив пуст
    */

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
    Вес уровня угрозы.

    Чем выше опасность,
    тем выше запись будет
    расположена среди популярных.
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


/*
=========================================================
КАРТОЧКА ПОПУЛЯРНОЙ СТАТЬИ
=========================================================
*/

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


/*
=========================================================
СЛУЧАЙНОЕ ДОСЬЕ
=========================================================
*/

function renderRandomFile() {

    const randomContainer =
        document.querySelector(
            ".random-card"
        );


    if (!randomContainer) {

        console.warn(
            "A.S.I.S: .random-card не найден"
        );

        return;

    }


    if (archive.length === 0) {
        return;
    }


    /*
    Выбираем случайную запись
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
        file.category ||
        "Архив";


    /*
    Заголовок
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
    Описание
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
    Категория
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
    Номер архива
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
    Кнопка
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
    Если внутри карточки есть изображение
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


/*
=========================================================
УНИВЕРСАЛЬНАЯ УСТАНОВКА СЧЁТЧИКА
=========================================================
*/

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


/*
=========================================================
ОШИБКА БАЗЫ ДАННЫХ
=========================================================
*/

function showIndexError() {


    /*
    Data-stat
    */

    document
        .querySelectorAll(
            "[data-stat]"
        )
        .forEach(element => {

            element.textContent = "—";

        });


    /*
    Стандартные ID счётчиков
    */

    const counterIds = [

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

    ];


    counterIds.forEach(id => {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent = "—";

        }

    });


    /*
    Популярные статьи
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


/*
=========================================================
НОРМАЛИЗАЦИЯ
=========================================================
*/

function normalize(value) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

}


/*
=========================================================
СОКРАЩЕНИЕ ТЕКСТА
=========================================================
*/

function truncateText(text, maxLength) {

    if (!text) {
        return "";
    }


    text = String(text);


    if (text.length <= maxLength) {
        return text;
    }


    return (
        text
            .substring(0, maxLength)
            .trim()
        + "..."
    );

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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*
=========================================================
ЗАЩИТА URL ДЛЯ BACKGROUND-IMAGE
=========================================================
*/

function escapeCSSURL(value) {

    return String(
        value ?? ""
    )
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");

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
    "%cARCHIVE SURVIVAL INFORMATION SYSTEM",
    "color:#8A949F;font-size:12px"
);
