// =========================
// A.S.I.S. v0.1
// app.js
// =========================

// Экран загрузки
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.transition = "opacity 0.6s ease";

            setTimeout(() => {
                loader.remove();
            }, 600);

        }, 1200);
    }
});


// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});


// Случайное досье
const dossiers = [

    'Объект №043 — "Пожиратель"',
    'Объект №018 — "Мясник"',
    'Локация — г. Нова',
    'Локация — Военная база "Восток"',
    'NPC — Доктор Морозов',
    'Фракция — Военные',
    'Локация — Берёзово',
    'Объект — Красный туман'

];

const dossierElement = document.querySelector(".random p strong");

if (dossierElement) {

    const randomIndex = Math.floor(Math.random() * dossiers.length);

    dossierElement.textContent = dossiers[randomIndex];

}


// Анимация появления блоков
const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

}, {
    threshold: 0.15
});


document.querySelectorAll(
    ".card, .briefing, .columns > div, .random, .stats div"
).forEach(element => {

    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition = "0.6s ease";

    observer.observe(element);

});
