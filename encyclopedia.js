/*
=========================================================
A.S.I.S.
Archive Survival Information System
encyclopedia.js v3.0
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    loadArchive();

    initSearch();

    initFilters();

});


/* ===================================================== */
/* ГЛОБАЛЬНЫЕ ДАННЫЕ */
/* ===================================================== */

let archive = [];

let currentFilter = "all";

let currentSearch = "";


/* ===================================================== */
/* ЗАГРУЗКА АРХИВА */
/* ===================================================== */

async function loadArchive() {

    try {

        const response =
            await fetch(
                "archive.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Ошибка загрузки archive.json: ${response.status}`
            );

        }


        archive =
            await response.json();


        if (!Array.isArray(archive)) {

            throw new Error(
                "archive.json должен содержать массив записей."
            );

        }


        console.log(
            "%cA.S.I.S ARCHIVE ONLINE",
            "color:#39D98A;font-size:18px;font-weight:bold"
        );


        console.log(
            `Загружено записей: ${archive.length}`
        );


        renderArchive();

        updateArchiveCounter();


    }

    catch (error) {

        console.error(
            "A.S.I.S DATABASE ERROR:",
            error
        );


        showArchiveError();

    }

}


/* ===================================================== */
/* ОТОБРАЖЕНИЕ АРХИВА */
/* ===================================================== */

function renderArchive() {

    const grid =
        document.getElementById(
            "archiveGrid"
        );


    if (!grid) {

        console.error(
            "Не найден элемент #archiveGrid"
        );

        return;

    }


    const filteredFiles =
        getFilteredArchive();


    grid.innerHTML = "";


    /* ------------------------------------------------- */
    /* НЕТ РЕЗУЛЬТАТОВ */
    /* ------------------------------------------------- */

    if (
        filteredFiles.length === 0
    ) {

        grid.innerHTML = `

            <div class="archive-empty">

                <div class="archive-empty-icon">
                    ⌕
                </div>


                <h3>
                    ЗАПИСИ НЕ НАЙДЕНЫ
                </h3>


                <p>
                    По заданным параметрам
                    в архиве отсутствуют записи.
                </p>


                <button
                    class="button primary"
                    id="resetArchive"
                    type="button"
                >
                    СБРОСИТЬ ФИЛЬТРЫ
                </button>

            </div>

        `;


        const resetButton =
            document.getElementById(
                "resetArchive"
            );


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetArchive
            );

        }


        updateArchiveCounter();

        return;

    }


    /* ------------------------------------------------- */
    /* СОЗДАНИЕ КАРТОЧЕК */
    /* ------------------------------------------------- */

    filteredFiles.forEach(file => {

        grid.insertAdjacentHTML(
            "beforeend",
            createArchiveCard(file)
        );

    });


    updateArchiveCounter();


    /*
    Добавляем небольшую анимацию
    после создания карточек.
    */

    const cards =
        grid.querySelectorAll(
            ".archive-card"
        );


    cards.forEach((card, index) => {

        card.style.animationDelay =
            `${Math.min(index * 40, 400)}ms`;

        card.classList.add(
            "archive-card-visible"
        );

    });

}


/* ===================================================== */
/* СОЗДАНИЕ КАРТОЧКИ */
/* ===================================================== */

function createArchiveCard(file) {

    const dangerClass =
        getDangerClass(
            file.danger
        );


    const image =
        file.image &&
        String(file.image).trim()
            ? file.image
            : "assets/images/no-image.webp";


    const description =
        file.description
            ? file.description
            : "Описание объекта отсутствует.";


    const status =
        file.status
            ? file.status
            : "НЕИЗВЕСТНО";


    const type =
        file.type
            ? file.type
            : "НЕИЗВЕСТНО";


    const category =
        file.category
            ? file.category
            : "АРХИВ";


    const id =
        file.id
            ? file.id
            : "UNKNOWN";


    const name =
        file.name
            ? file.name
            : "Без названия";


    return `

        <article
            class="archive-card"
            data-id="${escapeHTML(id)}"
            data-danger="${escapeHTML(
                file.danger || ""
            )}"
        >

            <div class="archive-card-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='assets/images/no-image.webp';
                    "
                >


                <span class="archive-card-id">
                    ${escapeHTML(id)}
                </span>


                <span
                    class="
                        archive-card-danger
                        ${dangerClass}
                    "
                >
                    ${escapeHTML(
                        file.danger || "UNKNOWN"
                    )}
                </span>

            </div>


            <div class="archive-card-content">

                <div class="archive-card-meta">

                    <span class="archive-card-type">
                        ${escapeHTML(type)}
                    </span>


                    <span class="archive-card-status">
                        ${escapeHTML(status)}
                    </span>

                </div>


                <h3 class="archive-card-title">

                    ${escapeHTML(name)}

                </h3>


                <p class="archive-card-category">

                    ${escapeHTML(category)}

                </p>


                <p class="archive-card-description">

                    ${escapeHTML(
                        truncateText(
                            description,
                            180
                        )
                    )}

                </p>


                <div class="archive-card-footer">

                    <span class="archive-card-threat">

                        ОПАСНОСТЬ:

                        <strong
                            class="${dangerClass}"
                        >
                            ${escapeHTML(
                                file.danger ||
                                "UNKNOWN"
                            )}
                        </strong>

                    </span>


                    <a
                        href="file.html?id=${encodeURIComponent(id)}"
                        class="
                            button
                            primary
                            archive-open-button
                        "
                    >
                        ОТКРЫТЬ ДОСЬЕ
                    </a>

                </div>

            </div>

        </article>

    `;

}


/* ===================================================== */
/* ФИЛЬТРАЦИЯ */
/* ===================================================== */

function getFilteredArchive() {

    let result =
        [...archive];


    /* ------------------------------------------------- */
    /* ФИЛЬТР КАТЕГОРИИ */
    /* ------------------------------------------------- */

    if (
        currentFilter !== "all"
    ) {

        result =
            result.filter(file => {

                const category =
                    normalize(
                        file.category
                    );


                const type =
                    normalize(
                        file.type
                    );


                const filter =
                    normalize(
                        currentFilter
                    );


                /*
                NPC может иметь:

                type: NPC
                category: Персонажи

                Поэтому проверяем
                оба значения.
                */

                if (
                    filter === "npc"
                ) {

                    return (

                        type === "npc" ||

                        category === "npc" ||

                        category === "персонажи"

                    );

                }


                /*
                Заражённые
                */

                if (
                    filter === "заражённые"
                ) {

                    return (

                        category === "заражённые" ||

                        type === "заражённый" ||

                        type === "зараженные"

                    );

                }


                /*
                Аномалии
                */

                if (
                    filter === "аномалии"
                ) {

                    return (

                        category === "аномалии" ||

                        type === "аномалия"

                    );

                }


                /*
                Локации
                */

                if (
                    filter === "локации"
                ) {

                    return (

                        category === "локации" ||

                        type === "локация"

                    );

                }


                /*
                Фракции
                */

                if (
                    filter === "фракции"
                ) {

                    return (

                        category === "фракции" ||

                        type === "фракция"

                    );

                }


                return (

                    category === filter ||

                    type === filter

                );

            });

    }


    /* ------------------------------------------------- */
    /* ПОИСК */
    /* ------------------------------------------------- */

    if (
        currentSearch !== ""
    ) {

        result =
            result.filter(file => {

                const searchData = [

                    file.id,

                    file.name,

                    file.type,

                    file.category,

                    file.description,

                    file.history,

                    file.advice,

                    file.status,

                    file.danger

                ]

                .filter(Boolean)

                .join(" ")

                .toLowerCase();


                return searchData.includes(
                    currentSearch
                );

            });

    }


    return result;

}


/* ===================================================== */
/* ПОИСК */
/* ===================================================== */

function initSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {

        console.warn(
            "A.S.I.S: searchInput не найден."
        );

        return;

    }


    input.addEventListener(
        "input",
        () => {

            currentSearch =
                input.value
                    .trim()
                    .toLowerCase();


            renderArchive();

        }
    );

}


/* ===================================================== */
/* ФИЛЬТРЫ */
/* ===================================================== */

function initFilters() {

    const buttons =
        document.querySelectorAll(
            ".filter"
        );


    if (!buttons.length) {

        console.warn(
            "A.S.I.S: кнопки .filter не найдены."
        );

        return;

    }


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                /*
                Поддерживаем:

                data-category
                data-type

                Например:

                data-category="Заражённые"

                или

                data-type="Заражённый"
                */

                const category =
                    button.dataset.category;


                const type =
                    button.dataset.type;


                currentFilter =
                    category ||
                    type ||
                    "all";


                renderArchive();

            }
        );

    });

}


/* ===================================================== */
/* СБРОС ФИЛЬТРОВ */
/* ===================================================== */

function resetArchive() {

    currentFilter =
        "all";


    currentSearch =
        "";


    const input =
        document.getElementById(
            "searchInput"
        );


    if (input) {

        input.value = "";

    }


    document
        .querySelectorAll(
            ".filter"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );


            const value =
                button.dataset.category ||
                button.dataset.type;


            if (
                !value ||
                normalize(value) === "all"
            ) {

                button.classList.add(
                    "active"
                );

            }

        });


    renderArchive();

}


/* ===================================================== */
/* СЧЁТЧИК ЗАПИСЕЙ */
/* ===================================================== */

function updateArchiveCounter() {

    const counter =
        document.getElementById(
            "archiveCount"
        );


    if (!counter) return;


    const count =
        getFilteredArchive().length;


    counter.textContent =
        count;

}


/* ===================================================== */
/* ОШИБКА БАЗЫ */
/* ===================================================== */

function showArchiveError() {

    const grid =
        document.getElementById(
            "archiveGrid"
        );


    if (!grid) return;


    grid.innerHTML = `

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
                id="retryArchive"
                type="button"
            >
                ПОВТОРИТЬ ЗАПРОС
            </button>

        </div>

    `;


    const retryButton =
        document.getElementById(
            "retryArchive"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            () => {

                loadArchive();

            }
        );

    }

}


/* ===================================================== */
/* УРОВЕНЬ ОПАСНОСТИ */
/* ===================================================== */

function getDangerClass(danger) {

    switch (
        String(danger)
            .toUpperCase()
            .trim()
    ) {

        case "LOW":

            return "danger-low";


        case "MEDIUM":

            return "danger-medium";


        case "HIGH":

            return "danger-high";


        case "EXTREME":

            return "danger-extreme";


        default:

            return "danger-unknown";

    }

}


/* ===================================================== */
/* НОРМАЛИЗАЦИЯ ТЕКСТА */
/* ===================================================== */

function normalize(value) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();

}


/* ===================================================== */
/* СОКРАЩЕНИЕ ОПИСАНИЯ */
/* ===================================================== */

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


/* ===================================================== */
/* ЗАЩИТА HTML */
/* ===================================================== */

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


/* ===================================================== */
/* A.S.I.S STATUS */
/* ===================================================== */

console.log(
    "%cA.S.I.S.",
    "color:#39D98A;font-size:24px;font-weight:bold"
);


console.log(
    "%cARCHIVE SURVIVAL INFORMATION SYSTEM",
    "color:#8A949F;font-size:12px"
);


/* ===================================================== */
/* ГОТОВО */
/* ===================================================== */
