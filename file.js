/*
=========================================================
A.S.I.S.
Archive Survival Information System

file.js v4.0
=========================================================
*/


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadFile();

    }
);


/* ===================================================== */
/* ЗАГРУЗКА ДОСЬЕ */
/* ===================================================== */

async function loadFile() {

    try {

        /*
        Получаем ID из URL.

        Пример:

        file.html?id=AS-001
        */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const id =
            params.get("id");


        if (!id) {

            showError(
                "НЕ УКАЗАН ID ДОСЬЕ"
            );

            return;

        }


        /*
        Загружаем центральную базу.
        */

        const response =
            await fetch(
                "archive.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `archive.json HTTP ${response.status}`
            );

        }


        const database =
            await response.json();


        if (!Array.isArray(database)) {

            throw new Error(
                "archive.json должен содержать массив записей."
            );

        }


        /*
        Ищем необходимое досье.
        */

        const file =
            database.find(
                item =>
                    String(item.id)
                        .toLowerCase() ===
                    String(id)
                        .toLowerCase()
            );


        /*
        Если записи нет.
        */

        if (!file) {

            showError(
                "ДОСЬЕ НЕ НАЙДЕНО"
            );

            return;

        }


        /*
        Заполняем страницу.
        */

        setText(
            "fileId",
            file.id
        );


        setText(
            "fileName",
            file.name
        );


        setText(
            "fileType",
            file.type
        );


        setText(
            "fileCategory",
            file.category
        );


        setText(
            "fileStatus",
            file.status
        );


        setText(
            "fileDanger",
            file.danger
        );


        setText(
            "fileDescription",
            file.description
        );


        setText(
            "fileHistory",
            file.history
        );


        setText(
            "fileAdvice",
            file.advice
        );


        /*
        Изображение.
        */

        setFileImage(
            file
        );


        /*
        Уровень угрозы.
        */

        setDangerStyle(
            file.danger
        );


        /*
        Статус.
        */

        setStatusStyle(
            file.status
        );


        /*
        Заголовок вкладки.
        */

        document.title =
            `A.S.I.S | ${file.name}`;


        /*
        Связанные записи.
        */

        loadRelated(
            database,
            file
        );


        console.log(
            "%cA.S.I.S DATABASE CONNECTED",
            "color:#39D98A;font-size:18px;font-weight:bold"
        );


        console.log(
            "FILE:",
            file.id
        );


    }

    catch (error) {

        console.error(
            "A.S.I.S DATABASE ERROR:",
            error
        );


        showError(
            "ОШИБКА БАЗЫ ДАННЫХ"
        );

    }

}


/* ===================================================== */
/* УСТАНОВКА ТЕКСТА */
/* ===================================================== */

function setText(
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
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""

            ? value

            : "Нет данных";

}


/* ===================================================== */
/* ИЗОБРАЖЕНИЕ ДОСЬЕ */
/* ===================================================== */

function setFileImage(
    file
) {

    const image =
        document.getElementById(
            "fileImage"
        );


    if (!image) {

        return;

    }


    /*
    Если изображение отсутствует,
    используем placeholder.
    */

    const imagePath =
        file.image &&
        String(file.image).trim()

            ? file.image

            : "placeholder.webp";


    image.src =
        imagePath;


    image.alt =
        file.name || "A.S.I.S";


    /*
    Если изображение не загрузилось,
    пробуем placeholder.
    */

    image.onerror =
        () => {

            image.onerror = null;

            image.src =
                "placeholder.webp";

        };

}


/* ===================================================== */
/* СТИЛЬ УРОВНЯ УГРОЗЫ */
/* ===================================================== */

function setDangerStyle(
    danger
) {

    const element =
        document.getElementById(
            "fileDanger"
        );


    if (!element) {

        return;

    }


    const value =
        String(
            danger || ""
        )
            .toLowerCase()
            .trim();


    /*
    Удаляем старые классы,
    если они были.
    */

    element.classList.remove(
        "threat",
        "threat-low",
        "threat-medium",
        "threat-high",
        "threat-extreme",
        "danger-low",
        "danger-medium",
        "danger-high",
        "danger-extreme",
        "danger-unknown"
    );


    element.classList.add(
        "threat"
    );


    switch (value) {

        case "low":

            element.classList.add(
                "threat-low"
            );

            break;


        case "medium":

            element.classList.add(
                "threat-medium"
            );

            break;


        case "high":

            element.classList.add(
                "threat-high"
            );

            break;


        case "extreme":

            element.classList.add(
                "threat-extreme"
            );

            break;


        default:

            element.classList.add(
                "danger-unknown"
            );

            break;

    }

}


/* ===================================================== */
/* СТИЛЬ СТАТУСА */
/* ===================================================== */

function setStatusStyle(
    status
) {

    const element =
        document.getElementById(
            "fileStatus"
        );


    if (!element) {

        return;

    }


    element.classList.remove(
        "status-active",
        "status-observation",
        "status-alive",
        "status-investigating",
        "status-inactive",
        "status-unknown"
    );


    const value =
        String(
            status || ""
        )
            .toLowerCase()
            .trim();


    if (
        value === "активен" ||
        value === "активна"
    ) {

        element.classList.add(
            "status-active"
        );

        return;

    }


    if (
        value === "наблюдение"
    ) {

        element.classList.add(
            "status-observation"
        );

        return;

    }


    if (
        value === "живой" ||
        value === "живая"
    ) {

        element.classList.add(
            "status-alive"
        );

        return;

    }


    if (
        value === "исследуется"
    ) {

        element.classList.add(
            "status-investigating"
        );

        return;

    }


    element.classList.add(
        "status-unknown"
    );

}


/* ===================================================== */
/* СВЯЗАННЫЕ ЗАПИСИ */
/* ===================================================== */

function loadRelated(
    database,
    current
) {

    const box =
        document.getElementById(
            "relatedFiles"
        );


    if (!box) {

        return;

    }


    /*
    Сначала ищем записи той же категории.

    Например:

    Зомби → другие заражённые
    Аномалия → другие аномалии
    */

    let related =
        database.filter(
            item =>

                item.id !== current.id &&

                (
                    item.category ===
                        current.category ||

                    item.type ===
                        current.type
                )
        );


    /*
    Максимум 4 связанные записи.
    */

    related =
        related.slice(
            0,
            4
        );


    box.innerHTML =
        "";


    /*
    Если связанных записей нет.
    */

    if (
        related.length === 0
    ) {

        box.innerHTML = `

            <div class="related-empty">

                Нет связанных записей.

            </div>

        `;

        return;

    }


    /*
    Создаём карточки.
    */

    related.forEach(
        item => {

            box.insertAdjacentHTML(
                "beforeend",
                createRelatedCard(item)
            );

        }
    );

}


/* ===================================================== */
/* КАРТОЧКА СВЯЗАННОЙ ЗАПИСИ */
/* ===================================================== */

function createRelatedCard(
    file
) {

    const image =
        file.image &&
        String(file.image).trim()

            ? file.image

            : "placeholder.webp";


    return `

        <a
            class="related-card"
            href="file.html?id=${encodeURIComponent(
                file.id
            )}"
        >

            <div class="related-card-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(
                        file.name || ""
                    )}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='placeholder.webp';
                    "
                >

            </div>


            <div class="related-card-content">

                <span class="related-card-id">

                    ${escapeHTML(
                        file.id || ""
                    )}

                </span>


                <h3>

                    ${escapeHTML(
                        file.name ||
                        "Без названия"
                    )}

                </h3>


                <span class="related-card-type">

                    ${escapeHTML(
                        file.type ||
                        "АРХИВ"
                    )}

                </span>

            </div>

        </a>

    `;

}


/* ===================================================== */
/* ОШИБКА */
/* ===================================================== */

function showError(
    message = "ДОСЬЕ НЕ НАЙДЕНО"
) {

    const name =
        document.getElementById(
            "fileName"
        );


    if (name) {

        name.textContent =
            message;

    }


    const description =
        document.getElementById(
            "fileDescription"
        );


    if (description) {

        description.textContent =
            "Запрашиваемая архивная запись отсутствует или временно недоступна.";

    }


    const history =
        document.getElementById(
            "fileHistory"
        );


    if (history) {

        history.textContent =
            "Центральная база A.S.I.S. не смогла предоставить информацию.";

    }


    const advice =
        document.getElementById(
            "fileAdvice"
        );


    if (advice) {

        advice.textContent =
            "Вернитесь в архив и выберите существующую запись.";

    }


    console.error(
        "A.S.I.S FILE ERROR:",
        message
    );

}


/* ===================================================== */
/* ЗАЩИТА HTML */
/* ===================================================== */

function escapeHTML(
    value
) {

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
/* ГОТОВО */
/* ===================================================== */

console.log(
    "%cA.S.I.S FILE SYSTEM ONLINE",
    "color:#39D98A;font-size:16px;font-weight:bold"
);
