/*
=========================================================
A.S.I.S.
Archive Survival Information System

news-view.js
Динамическая страница отдельной новости

Поддерживаемые блоки:

title
subtitle
side
text
image
quote
warning
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    loadNews();

});


/* =====================================================
   ГЛОБАЛЬНЫЕ ДАННЫЕ
===================================================== */

let newsArchive = [];


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
            "%cA.S.I.S. NEWS VIEW ONLINE",
            "color:#39D98A;font-size:18px;font-weight:bold"
        );


        console.log(
            `Загружено новостей: ${newsArchive.length}`
        );


        const newsId =
            getNewsIdFromURL();


        if (!newsId) {

            showNewsError(
                "Идентификатор новости отсутствует."
            );

            return;

        }


        const news =
            findNewsById(newsId);


        if (!news) {

            showNewsError(
                `Новость ${newsId} не найдена в архиве.`
            );

            return;

        }


        renderNews(news);

    }

    catch (error) {

        console.error(
            "A.S.I.S. NEWS DATABASE ERROR:",
            error
        );


        showNewsError(
            "Не удалось загрузить базу новостей A.S.I.S."
        );

    }

}


/* =====================================================
   ПОЛУЧЕНИЕ ID ИЗ URL
===================================================== */

function getNewsIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("id") ||
        params.get("news") ||
        ""
    ).trim();

}


/* =====================================================
   ПОИСК НОВОСТИ
===================================================== */

function findNewsById(id) {

    const target =
        String(id)
            .trim()
            .toLowerCase();


    return newsArchive.find(news => {

        return (
            String(news.id || "")
                .trim()
                .toLowerCase()
            === target
        );

    });

}


/* =====================================================
   ОТОБРАЖЕНИЕ НОВОСТИ
===================================================== */

function renderNews(news) {

    updatePageMeta(news);

    renderHeaderInfo(news);

    renderNewsBlocks(news);

    renderLegacyContent(news);

}


/* =====================================================
   META / TITLE
===================================================== */

function updatePageMeta(news) {

    const title =
        news.title ||
        "Новость A.S.I.S.";


    document.title =
        `${title} — A.S.I.S.`;


    const description =
        news.description ||
        news.content ||
        title;


    const meta =
        document.querySelector(
            'meta[name="description"]'
        );


    if (meta) {

        meta.setAttribute(
            "content",
            truncateText(
                description,
                160
            )
        );

    }

}


/* =====================================================
   ИНФОРМАЦИЯ В ШАПКЕ НОВОСТИ
===================================================== */

function renderHeaderInfo(news) {

    /*
    Возможные элементы HTML:

    #newsTitle
    #newsDate
    #newsCategory
    #newsStatus
    #newsDescription
    #newsHeroImage
    */


    const title =
        document.getElementById(
            "newsTitle"
        );


    if (title) {

        title.textContent =
            news.title ||
            "Без названия";

    }


    const date =
        document.getElementById(
            "newsDate"
        );


    if (date) {

        date.textContent =
            news.date ||
            "";

    }


    const category =
        document.getElementById(
            "newsCategory"
        );


    if (category) {

        category.textContent =
            news.category ||
            "АРХИВ";

    }


    const status =
        document.getElementById(
            "newsStatus"
        );


    if (status) {

        status.textContent =
            news.status ||
            "ОПУБЛИКОВАНО";

    }


    const description =
        document.getElementById(
            "newsDescription"
        );


    if (description) {

        description.textContent =
            news.description ||
            "";

    }


    const heroImage =
        document.getElementById(
            "newsHeroImage"
        );


    if (
        heroImage &&
        news.image
    ) {

        heroImage.src =
            news.image;


        heroImage.alt =
            news.title ||
            "Новость A.S.I.S.";

    }

}


/* =====================================================
   РЕНДЕР BLOCKS
===================================================== */

function renderNewsBlocks(news) {

    const container =
        document.getElementById(
            "newsContent"
        );


    /*
    Если контейнера нет,
    пробуем найти стандартные варианты.
    */

    const target =
        container ||
        document.querySelector(
            ".news-content"
        ) ||
        document.querySelector(
            ".article-content"
        );


    if (!target) {

        console.warn(
            "Контейнер #newsContent не найден."
        );

        return;

    }


    /*
    Очищаем старое содержимое.
    */

    target.innerHTML = "";


    /*
    Если blocks отсутствует,
    используем старый формат.
    */

    if (
        !Array.isArray(
            news.blocks
        )
        ||
        news.blocks.length === 0
    ) {

        renderOldNewsFormat(
            target,
            news
        );

        return;

    }


    /*
    Создаём каждый блок
    строго в том порядке,
    в котором он находится
    в news.json.
    */

    news.blocks.forEach(
        (block, index) => {

            const element =
                createNewsBlock(
                    block,
                    index
                );


            if (element) {

                target.appendChild(
                    element
                );

            }

        }
    );

}


/* =====================================================
   СОЗДАНИЕ БЛОКА
===================================================== */

function createNewsBlock(
    block,
    index
) {

    if (!block) {

        return null;

    }


    const type =
        String(
            block.type || ""
        )
        .trim()
        .toLowerCase();


    switch (type) {


        /* =============================================
           TITLE
        ============================================= */

        case "title": {

            const element =
                document.createElement(
                    "h1"
                );


            element.className =
                "news-block-title";


            element.textContent =
                block.content ||
                "";


            return element;

        }


        /* =============================================
           SUBTITLE
        ============================================= */

        case "subtitle": {

            const element =
                document.createElement(
                    "h2"
                );


            element.className =
                "news-block-subtitle";


            element.textContent =
                block.content ||
                "";


            return element;

        }


        /* =============================================
           TEXT
        ============================================= */

        case "text": {

            const element =
                document.createElement(
                    "p"
                );


            element.className =
                "news-block-text";


            element.textContent =
                block.content ||
                "";


            return element;

        }


        /* =============================================
           SIDE
        ============================================= */

        case "side": {

            const element =
                document.createElement(
                    "aside"
                );


            element.className =
                "news-block-side";


            element.textContent =
                block.content ||
                "";


            return element;

        }


        /* =============================================
           QUOTE
        ============================================= */

        case "quote": {

            const element =
                document.createElement(
                    "blockquote"
                );


            element.className =
                "news-block-quote";


            element.textContent =
                block.content ||
                "";


            return element;

        }


        /* =============================================
           WARNING
        ============================================= */

        case "warning": {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "news-block-warning";


            const label =
                document.createElement(
                    "span"
                );


            label.className =
                "news-warning-label";


            label.textContent =
                "⚠ ПРЕДУПРЕЖДЕНИЕ";


            const text =
                document.createElement(
                    "p"
                );


            text.textContent =
                block.content ||
                "";


            element.appendChild(
                label
            );


            element.appendChild(
                text
            );


            return element;

        }


        /* =============================================
           IMAGE
        ============================================= */

        case "image": {

            const wrapper =
                document.createElement(
                    "figure"
                );


            wrapper.className =
                "news-block-image";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                block.src ||
                block.image ||
                "placeholder.webp";


            image.alt =
                block.alt ||
                block.caption ||
                "Изображение новости";


            image.loading =
                "lazy";


            image.onerror =
                function () {

                    this.src =
                        "placeholder.webp";

                };


            wrapper.appendChild(
                image
            );


            /*
            Если указана подпись,
            выводим её под изображением.
            */

            if (
                block.caption
            ) {

                const caption =
                    document.createElement(
                        "figcaption"
                    );


                caption.textContent =
                    block.caption;


                wrapper.appendChild(
                    caption
                );

            }


            return wrapper;

        }


        /* =============================================
           НЕИЗВЕСТНЫЙ ТИП
        ============================================= */

        default: {

            console.warn(
                `Неизвестный тип блока: ${type}`
            );


            /*
            Чтобы случайно не потерять текст,
            неизвестный блок превращается
            в обычный текст.
            */

            if (
                block.content
            ) {

                const element =
                    document.createElement(
                        "p"
                    );


                element.className =
                    "news-block-text";


                element.textContent =
                    block.content;


                return element;

            }


            return null;

        }

    }

}


/* =====================================================
   СТАРЫЙ ФОРМАТ NEWS.JSON
===================================================== */

function renderOldNewsFormat(
    container,
    news
) {

    /*
    Поддержка старой структуры:

    title
    image
    description
    content
    */


    if (news.title) {

        const title =
            document.createElement(
                "h1"
            );


        title.className =
            "news-block-title";


        title.textContent =
            news.title;


        container.appendChild(
            title
        );

    }


    if (news.image) {

        const image =
            document.createElement(
                "img"
            );


        image.className =
            "news-block-image";


        image.src =
            news.image;


        image.alt =
            news.title ||
            "Новость";


        image.loading =
            "lazy";


        image.onerror =
            function () {

                this.src =
                    "placeholder.webp";

            };


        container.appendChild(
            image
        );

    }


    if (news.description) {

        const subtitle =
            document.createElement(
                "p"
            );


        subtitle.className =
            "news-block-subtitle";


        subtitle.textContent =
            news.description;


        container.appendChild(
            subtitle
        );

    }


    if (news.content) {

        const text =
            document.createElement(
                "p"
            );


        text.className =
            "news-block-text";


        text.textContent =
            news.content;


        container.appendChild(
            text
        );

    }

}


/* =====================================================
   ДОПОЛНИТЕЛЬНАЯ СОВМЕСТИМОСТЬ
===================================================== */

function renderLegacyContent(news) {

    /*
    Если в HTML есть отдельный
    #newsLegacyContent, можно вывести
    старый content туда.
    */

    const element =
        document.getElementById(
            "newsLegacyContent"
        );


    if (!element) {

        return;

    }


    if (
        news.content &&
        !Array.isArray(news.blocks)
    ) {

        element.textContent =
            news.content;

    }
    else {

        element.innerHTML =
            "";

    }

}


/* =====================================================
   ОШИБКА
===================================================== */

function showNewsError(
    message
) {

    const container =
        document.getElementById(
            "newsContent"
        )
        ||
        document.querySelector(
            ".news-content"
        )
        ||
        document.querySelector(
            ".article-content"
        );


    if (!container) {

        console.error(
            message
        );

        return;

    }


    container.innerHTML = `

        <div class="archive-error">

            <div class="archive-error-code">
                NEWS ERROR
            </div>

            <h2>
                НОВОСТЬ НЕ НАЙДЕНА
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

            <a
                href="news.html"
                class="button primary">

                ← ВЕРНУТЬСЯ К НОВОСТЯМ

            </a>

        </div>

    `;

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


/* =====================================================
   A.S.I.S. STATUS
===================================================== */

console.log(
    "%cA.S.I.S.",
    "color:#39D98A;font-size:24px;font-weight:bold"
);


console.log(
    "%cNEWS VIEW SYSTEM",
    "color:#8A949F;font-size:12px"
);
