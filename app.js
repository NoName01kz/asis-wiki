/*
=========================================
A.S.I.S.
Archive Survival Information System
app.js v1.0
=========================================
*/

document.addEventListener("DOMContentLoaded", () => {

    initLoader();

    initScrollAnimation();

    initCounters();

    initRandomFile();

    initHeader();

});



/* ========================================= */
/* ЗАГРУЗКА */
/* ========================================= */

function initLoader() {

    const loader = document.getElementById("loader");

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

    const header = document.querySelector(".header");

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

document.querySelectorAll("a[href^='#']").forEach(link => {

    link.addEventListener("click", e => {

        e.preventDefault();

        const target = document.querySelector(link.getAttribute("href"));

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

    const elements = document.querySelectorAll(

        ".stat-card," +
        ".section-card," +
        ".news-card," +
        ".popular-card," +
        ".random-card," +
        ".site-card," +
        ".briefing-card"

    );

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    }, {

        threshold: 0.15

    });

    elements.forEach(element => {

        element.classList.add("fade");

        observer.observe(element);

    });

}

/* ========================================= */
/* АНИМИРОВАННЫЕ СЧЁТЧИКИ */
/* ========================================= */

function initCounters() {

    const counters = document.querySelectorAll(

        ".stat-card h2, .site-card h2"

    );

    counters.forEach(counter => {

        const target = parseInt(counter.textContent);

        if (isNaN(target)) return;

        let current = 0;

        const step = Math.max(1, Math.ceil(target / 80));

        const timer = setInterval(() => {

            current += step;

            if (current >= target) {

                current = target;

                clearInterval(timer);

            }

            counter.textContent = current;

        }, 20);

    });

}
/* ========================================= */
/* СЛУЧАЙНОЕ ДОСЬЕ */
/* ========================================= */

/* ========================================= */
/* СЛУЧАЙНОЕ ДОСЬЕ */
/* ========================================= */

async function initRandomFile() {

    const title =
        document.querySelector(".random-left h2");

    const text =
        document.querySelector(".random-left p");

    const button =
        document.querySelector(".random-left .button");

    const archiveNumber =
        document.querySelector(".random-card .archive-number");


    if (!title || !text) return;


    try {

        const response =
            await fetch("archive.json", {
                cache: "no-store"
            });


        if (!response.ok) {

            throw new Error(
                "Не удалось загрузить archive.json"
            );

        }


        const archive =
            await response.json();


        if (
            !Array.isArray(archive) ||
            archive.length === 0
        ) {

            throw new Error(
                "Архив пуст"
            );

        }


        /* -----------------------------------------
           ВЫБИРАЕМ СЛУЧАЙНУЮ ЗАПИСЬ
        ----------------------------------------- */

        const random =
            archive[
                Math.floor(
                    Math.random() * archive.length
                )
            ];


        /* -----------------------------------------
           НАЗВАНИЕ
        ----------------------------------------- */

        title.textContent =
            `Объект ${random.id} — «${random.name}»`;


        /* -----------------------------------------
           ОПИСАНИЕ
        ----------------------------------------- */

        text.textContent =
            random.description ||
            "Описание объекта отсутствует.";


        /* -----------------------------------------
           НОМЕР ДОСЬЕ
        ----------------------------------------- */

        if (archiveNumber) {

            const number =
                String(random.id || "")
                    .replace(/^AS-/i, "");

            archiveNumber.textContent =
                number.padStart(3, "0");

        }


        /* -----------------------------------------
           КНОПКА
        ----------------------------------------- */

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

        /*
        Если archive.json недоступен,
        существующее содержимое HTML
        останется на месте.
        */

    }

}
/* ========================================= */
/* МОБИЛЬНОЕ МЕНЮ */
/* ========================================= */

function initMobileMenu() {

    const button = document.querySelector(".mobile-menu");
    const navigation = document.querySelector(".navigation");

    if (!button || !navigation) return;

    button.addEventListener("click", () => {

        navigation.classList.toggle("mobile-open");

        button.classList.toggle("opened");

    });

}

initMobileMenu();

/* ========================================= */
/* ПОИСК (ЗАГОТОВКА) */
/* ========================================= */

function initSearch() {

    const input = document.querySelector(".search-box input");

    if (!input) return;

    input.addEventListener("input", function () {

        console.log("Поиск:", this.value);

        /*
        Позже здесь будет поиск
        по Firebase или JSON базе статей.
        */

    });

}

initSearch();

/* ========================================= */
/* ЭФФЕКТ СВЕЧЕНИЯ КАРТОЧЕК */
/* ========================================= */

const cards = document.querySelectorAll(

    ".section-card, .news-card, .popular-card, .site-card"

);

cards.forEach(card => {

    card.addEventListener("mousemove", e => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;

        const y = e.clientY - rect.top;

        card.style.background = `radial-gradient(circle at ${x}px ${y}px,
        rgba(57,217,138,.12),
        rgba(28,33,40,1) 70%)`;

    });

    card.addEventListener("mouseleave", () => {

        card.style.background = "";

    });

});


/* ========================================= */
/* КНОПКА "НАВЕРХ" */
/* ========================================= */

const topButton = document.createElement("button");

topButton.innerHTML = "↑";

topButton.className = "scroll-top";

document.body.appendChild(topButton);

window.addEventListener("scroll", () => {

    if (window.scrollY > 500) {

        topButton.classList.add("visible");

    } else {

        topButton.classList.remove("visible");

    }

});

topButton.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});


/* ========================================= */
/* ПРИВЕТСТВИЕ */
/* ========================================= */

console.log(

"%cA.S.I.S. v1.0",

"color:#39D98A;font-size:20px;font-weight:bold;"

);

console.log(

"Archive Survival Information System"

);


/* ========================================= */
/* ПОДГОТОВКА FIREBASE */
/* ========================================= */

const ASIS = {

    version: "1.0",

    firebase: false,

    user: null

};


/*
========================================================

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

========================================================
*/


/* ========================================= */
/* ГОТОВО */
/* ========================================= */
