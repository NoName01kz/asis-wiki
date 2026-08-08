/*
===========================================================
A.S.I.S.
Archive Survival Information System

news-view.js
Просмотр отдельной новости

URL:

news-view.html?id=NEWS-001

===========================================================
*/


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadNews();

    }
);


/* =========================================================
   ГЛОБАЛЬНЫЕ ДАННЫЕ
========================================================= */

let newsArchive = [];


/* =========================================================
   ЗАГРУЗКА НОВОСТИ
========================================================= */

async function loadNews() {

    try {

        /*
        Получаем ID из URL.

        Например:

        news-view.html?id=NEWS-001
        */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const newsId =
            params.get("id");


        /*
        Если ID отсутствует.
        */

        if (!newsId) {

            throw new Error(
                "ID новости отсутствует в URL"
            );

        }


        /*
        Загружаем news.json.
        */

        const response =
            await fetch(
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


        newsArchive =
            await response.json();


        /*
        Проверяем структуру.
        */

        if (!Array.isArray(newsArchive)) {

            throw new Error(
                "news.json должен содержать массив новостей"
            );

        }


        /*
        Ищем новость по ID.
        */

        const news =
            newsArchive.find(
                item =>
                    String(item.id) ===
                    String(newsId)
            );


        /*
        Новость не найдена.
        */

        if (!news) {

            showNewsError(
                "Новость не найдена",
                `Запись с ID "${newsId}" отсутствует в news.json.`
            );

            return;

        }


        /*
        Отрисовываем новость.
        */

        renderNews(news);


        /*
        Убираем loader.
        */

        hideLoader();


        console.log(
            "%cA.S.I.S NEWS VIEW ONLINE",
            "color:#39D98A;font-size:18px;font-weight:bold"
        );


        console.log(
            `Открыта новость: ${news.id}`
        );

    }

    catch (error) {

        console.error(
            "A.S.I.S NEWS VIEW ERROR:",
            error
        );


        showNewsError(
            "Ошибка загрузки новости",
            "Не удалось получить данные из базы news.json."
        );

    }

}


/* =========================================================
   ОТРИСОВКА НОВОСТИ
========================================================= */

function renderNews(news) {


    /*
    TITLE
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



    /*
    DESCRIPTION
    */

    const description =
        document.getElementById(
            "newsDescription"
        );


    if (description) {

        description.textContent =
            news.description ||
            "";

    }



    /*
    CATEGORY
    */

    const category =
        document.getElementById(
            "newsCategory"
        );


    if (category) {

        category.textContent =
            news.category ||
            "НОВОСТИ A.S.I.S.";

    }



    /*
    DATE
    */

    const date =
        document.getElementById(
            "newsDate"
        );


    if (date) {

        date.textContent =
            news.date ||
            "Дата неизвестна";

    }



    /*
    STATUS
    */

    const status =
        document.getElementById(
            "newsStatus"
        );


    if (status) {

        status.textContent =
            news.status ||
            "ОПУБЛИКОВАНО";

    }



    /*
    CATEGORY META
    */

    const categoryMeta =
        document.getElementById(
            "newsCategoryMeta"
        );


    if (categoryMeta) {

        categoryMeta.textContent =
            news.category ||
            "Новости";

    }



    /*
    IMAGE
    */

    const image =
        document.getElementById(
            "newsImage"
        );


    const imageWrapper =
        document.getElementById(
            "newsImageWrapper"
        );


    if (
        image &&
        news.image
    ) {

        image.src =
            news.image;


        image.alt =
            news.title ||
            "Новость A.S.I.S.";


        image.onerror =
            () => {

                if (imageWrapper) {

                    imageWrapper.style.display =
                        "none";

                }

            };

    }
    else {

        if (imageWrapper) {

            imageWrapper.style.display =
                "none";

        }

    }



    /*
    CONTENT
    */

    const content =
        document.getElementById(
            "newsContent"
        );


    if (content) {

        renderNewsContent(
            content,
            news.content
        );

    }



    /*
    TITLE ВКЛАДКИ БРАУЗЕРА
    */

    document.title =
        `${news.title || "Новость"} — A.S.I.S.`;

}


/* =========================================================
   ТЕКСТ НОВОСТИ
========================================================= */

function renderNewsContent(
    container,
    text
) {


    container.innerHTML = "";


    if (!text) {

        const paragraph =
            document.createElement(
                "p"
            );


        paragraph.textContent =
            "Содержимое новости отсутствует.";


        container.appendChild(
            paragraph
        );


        return;

    }


    /*
    Поддерживаем переносы строк.

    Например:

    Первая часть.

    Вторая часть.

    Третья часть.
    */

    const paragraphs =
        String(text)
            .split(/\n\s*\n/)
            .map(
                item =>
                    item.trim()
            )
            .filter(
                item =>
                    item.length > 0
            );


    paragraphs.forEach(
        paragraphText => {

            const paragraph =
                document.createElement(
                    "p"
                );


            paragraph.textContent =
                paragraphText;


            container.appendChild(
                paragraph
            );

        }
    );

}


/* =========================================================
   ОШИБКА
========================================================= */

function showNewsError(
    titleText,
    messageText
) {


    /*
    Скрываем основной материал.
    */

    const view =
        document.getElementById(
            "newsView"
        );


    if (view) {

        view.style.display =
            "none";

    }



    /*
    Показываем ошибку.
    */

    const error =
        document.getElementById(
            "newsError"
        );


    if (error) {

        error.style.display =
            "block";

    }



    /*
    Заголовок ошибки.
    */

    const errorTitle =
        document.getElementById(
            "newsErrorTitle"
        );


    if (errorTitle) {

        errorTitle.textContent =
            titleText;

    }



    /*
    Текст ошибки.
    */

    const errorText =
        document.getElementById(
            "newsErrorText"
        );


    if (errorText) {

        errorText.textContent =
            messageText;

    }



    hideLoader();

}


/* =========================================================
   LOADER
========================================================= */

function hideLoader() {

    const loader =
        document.querySelector(
            ".loader"
        );


    if (!loader) {

        return;

    }


    loader.classList.add(
        "hidden"
    );


    /*
    На случай, если в style.css
    нет анимации скрытия.
    */

    setTimeout(
        () => {

            loader.style.display =
                "none";

        },
        500
    );

}


/* =========================================================
   ПОИСК ИЗ HEADER
========================================================= */

const search =
    document.getElementById(
        "newsViewSearch"
    );


if (search) {

    search.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                const query =
                    search.value.trim();


                if (!query) {

                    window.location.href =
                        "news.html";

                    return;

                }


                window.location.href =
                    `news.html?search=${encodeURIComponent(query)}`;

            }

        }
    );

}


/* =========================================================
   МОБИЛЬНОЕ МЕНЮ
========================================================= */

const mobileMenu =
    document.querySelector(
        ".mobile-menu"
    );


const navigation =
    document.querySelector(
        ".navigation"
    );


if (
    mobileMenu &&
    navigation
) {

    mobileMenu.addEventListener(
        "click",
        () => {

            navigation.classList.toggle(
                "mobile-open"
            );

        }
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
