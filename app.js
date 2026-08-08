/*
=========================================================
A.S.I.S.
Archive Survival Information System
app.js v2.0
=========================================================
*/


document.addEventListener("DOMContentLoaded", () => {

    initLoader();

    initScrollAnimation();

    initCounters();

    initRandomFile();

    initPopularArticles();

    initHeader();

});


/* ========================================= */
/* ЗАГРУЗКА */
/* ========================================= */

function initLoader() {

    const loader =
        document.getElementById("loader");

    if (!loader) return;


    setTimeout(() => {

        loader.style.opacity = "0";

        loader.style.pointerEvents = "none";


        setTimeout(() => {

            loader.remove();

        }, 700);

    }, 1800);

}


/* ========================================= */
/* HEADER */
/* ========================================= */

function initHeader() {

    const header =
        document.querySelector(".header");

    if (!header) return;


    window.addEventListener("scroll", () => {

        if (window.scrollY > 80) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    });

}


/* ========================================= */
/* ПЛАВНАЯ ПРОКРУТКА */
/* ========================================= */

document.querySelectorAll(
    "a[href^='#']"
).forEach(link => {

    link.addEventListener("click", e => {

        e.preventDefault();


        const target =
            document.querySelector(
                link.getAttribute("href")
            );


        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});


/* ========================================= */
/* АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ */
/* ========================================= */

function initScrollAnimation() {

    const elements =
        document.querySelectorAll(

            ".stat-card," +
            ".section-card," +
            ".news-card," +
            ".popular-card," +
            ".random-card," +
            ".site-card," +
            ".briefing-card"

        );


    if (!("IntersectionObserver" in window)) {

        elements.forEach(element => {

            element.classList.add("show");

        });

        return;

    }


    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "show"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },

            {
                threshold: 0.15
            }

        );


    elements.forEach(element => {

        element.classList.add("fade");

        observer.observe(element);

    });

}


/* ========================================= */
/* АНИМИРОВАННЫЕ СЧЁТЧИКИ */
/* ========================================= */

function initCounters() {

    const counters =
        document.querySelectorAll(
            ".stat-card h2, .site-card h2"
        );


    counters.forEach(counter => {

        const target =
            parseInt(
                counter.textContent,
                10
            );


        if (isNaN(target)) return;


        let current = 0;


        const step =
            Math.max(
                1,
                Math.ceil(target / 80)
            );


        const timer =
            setInterval(() => {

                current += step;


                if (current >= target) {

                    current = target;

                    clearInterval(timer);

                }


                counter.textContent =
                    current;

            }, 20);

    });

}


/* ========================================= */
/* СЛУЧАЙНОЕ ДОСЬЕ */
/* ========================================= */

async function initRandomFile() {

    const title =
        document.querySelector(
            ".random-left h2"
        );


    const text =
        document.querySelector(
            ".random-left p"
        );


    const button =
        document.querySelector(
            ".random-left .button"
        );


    const archiveNumber =
        document.querySelector(
            ".random-card .archive-number"
        );


    if (!title || !text) return;


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
                `archive.json HTTP ${response.status}`
            );

        }


        const archive =
            await response.json();


        if (
            !Array.isArray(archive) ||
            archive.length === 0
        ) {

            throw new Error(
                "Архив пуст или имеет неверный формат."
            );

        }


        const random =
            archive[
                Math.floor(
                    Math.random() *
                    archive.length
                )
            ];


        title.textContent =
            `Объект ${random.id} — «${random.name || "Без названия"}»`;


        text.textContent =
            random.description ||
            "Описание объекта отсутствует.";


        if (archiveNumber) {

            const number =
                String(random.id || "")
                    .replace(/^AS-/i, "");


            archiveNumber.textContent =
                number.padStart(3, "0");

        }


        if (button) {

            button.href =
                `file.html?id=${encodeURIComponent(
                    random.id
                )}`;

            button.textContent =
                "Открыть досье";

        }


        console.log(
            "%cA.S.I.S RANDOM DOSSIER",
            "color:#39D98A;font-size:16px;font-weight:bold",
            random
        );


    } catch (error) {

        console.error(
            "A.S.I.S RANDOM DOSSIER ERROR:",
            error
        );

    }

}


/* ========================================= */
/* ПОПУЛЯРНЫЕ СТАТЬИ */
/* ========================================= */

async function initPopularArticles() {

    const grid =
        document.getElementById(
            "popularGrid"
        );


    /*
    Если контейнера нет,
    не ломаем остальную страницу.
    */

    if (!grid) {

        console.warn(
            "A.S.I.S: #popularGrid не найден."
        );

        return;

    }


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
                `archive.json HTTP ${response.status}`
            );

        }


        const archive =
            await response.json();


        if (
            !Array.isArray(archive) ||
            archive.length === 0
        ) {

            throw new Error(
                "Архив пуст или имеет неверный формат."
            );

        }


        /*
        Сейчас показываем первые 3 записи.

        Позже сюда можно подключить
        Firebase и сортировку по просмотрам.
        */

        const popular =
            archive.slice(0, 3);


        grid.innerHTML = "";


        popular.forEach(file => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "popular-card";


            const image =
                file.image
                    ? `
                        <div class="popular-image">

                            <img
                                src="${escapeHTML(file.image)}"
                                alt="${escapeHTML(file.name || "")}"
                                loading="lazy"
                                onerror="this.style.display='none'"
                            >

                        </div>
                      `
                    : "";


            const type =
                file.type ||
                "АРХИВ";


            const description =
                truncateText(
                    file.description ||
                    "Описание объекта отсутствует.",
                    140
                );


            card.innerHTML = `

                ${image}

                <div class="popular-content">

                    <span class="popular-type">

                        ${escapeHTML(type)}

                    </span>


                    <h3>

                        ${escapeHTML(
                            file.name ||
                            "Без названия"
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            description
                        )}

                    </p>


                    <a
                        href="file.html?id=${encodeURIComponent(
                            file.id
                        )}"
                        class="button secondary"
                    >

                        ОТКРЫТЬ ДОСЬЕ

                    </a>

                </div>

            `;


            grid.appendChild(card);

        });


        /*
        Добавляем анимацию новым карточкам.
        */

        const newCards =
            grid.querySelectorAll(
                ".popular-card"
            );


        newCards.forEach(card => {

            card.classList.add("fade");


            requestAnimationFrame(() => {

                card.classList.add("show");

            });

        });


        console.log(
            "%cA.S.I.S POPULAR ARTICLES ONLINE",
            "color:#39D98A;font-size:16px;font-weight:bold",
            popular
        );


    } catch (error) {

        console.error(
            "A.S.I.S POPULAR ARTICLES ERROR:",
            error
        );

    }

}


/* ========================================= */
/* МОБИЛЬНОЕ МЕНЮ */
/* ========================================= */

function initMobileMenu() {

    const button =
        document.querySelector(
            ".mobile-menu"
        );


    const navigation =
        document.querySelector(
            ".navigation"
        );


    if (!button || !navigation) return;


    button.addEventListener(
        "click",
        () => {

            navigation.classList.toggle(
                "mobile-open"
            );


            button.classList.toggle(
                "opened"
            );

        }
    );

}


initMobileMenu();


/* ========================================= */
/* ПОИСК */
/* ========================================= */

function initSearch() {

    const input =
        document.querySelector(
            ".search-box input"
        );


    if (!input) return;


    input.addEventListener(
        "input",
        function () {

            console.log(
                "Поиск:",
                this.value
            );


            /*
            Позже здесь будет настоящий
            поиск по базе A.S.I.S.
            */

        }
    );

}


initSearch();


/* ========================================= */
/* ЭФФЕКТ СВЕЧЕНИЯ КАРТОЧЕК */
/* ========================================= */

function initCardGlow() {

    const cards =
        document.querySelectorAll(

            ".section-card, " +
            ".news-card, " +
            ".popular-card, " +
            ".site-card"

        );


    cards.forEach(card => {

        card.addEventListener(
            "mousemove",
            e => {

                const rect =
                    card.getBoundingClientRect();


                const x =
                    e.clientX -
                    rect.left;


                const y =
                    e.clientY -
                    rect.top;


                card.style.background =
                    `radial-gradient(
                        circle at ${x}px ${y}px,
                        rgba(57,217,138,.12),
                        rgba(28,33,40,1) 70%
                    )`;

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.style.background =
                    "";

            }
        );

    });

}


initCardGlow();


/* ========================================= */
/* КНОПКА "НАВЕРХ" */
/* ========================================= */

const topButton =
    document.createElement(
        "button"
    );


topButton.innerHTML =
    "↑";


topButton.className =
    "scroll-top";


topButton.setAttribute(
    "aria-label",
    "Наверх"
);


document.body.appendChild(
    topButton
);


window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 500) {

            topButton.classList.add(
                "visible"
            );

        } else {

            topButton.classList.remove(
                "visible"
            );

        }

    }
);


topButton.addEventListener(
    "click",
    () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);


/* ========================================= */
/* ПРИВЕТСТВИЕ */
/* ========================================= */

console.log(
    "%cA.S.I.S. v2.0",
    "color:#39D98A;font-size:20px;font-weight:bold;"
);


console.log(
    "Archive Survival Information System"
);


/* ========================================= */
/* FIREBASE — ПОДГОТОВКА */
/* ========================================= */

const ASIS = {

    version: "2.0",

    firebase: false,

    user: null

};


/*
Позже здесь подключатся:

✓ Firebase Authentication
✓ Firebase Firestore
✓ Комментарии
✓ Новости
✓ Авторизация
✓ Личный кабинет
✓ Админ-панель
✓ Онлайн пользователи
✓ Поиск по базе
*/


/* ========================================= */
/* ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ */
/* ========================================= */

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


/* ========================================= */
/* ОБРЕЗКА ТЕКСТА */
/* ========================================= */

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


/* ========================================= */
/* ГОТОВО */
/* ========================================= */
