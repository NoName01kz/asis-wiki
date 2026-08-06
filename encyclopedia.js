/*
=========================================
A.S.I.S.
Archive Survival Information System
encyclopedia.js v1.0
=========================================
*/


document.addEventListener("DOMContentLoaded", () => {


    initArchive();

    initArchiveSearch();

    initArchiveFilters();

    initRandomArchive();



});



/* ========================================= */
/* БАЗА ДАННЫХ */
/* ========================================= */


const archiveFiles = [


{

id:"AS-001",

name:"Пожиратель",

type:"Заражённый",

danger:"CRITICAL",

status:"АКТИВЕН",

description:
"Высокоопасный мутировавший организм. Обладает огромной силой и агрессивным поведением."

},



{

id:"AS-002",

name:"Красный туман",

type:"Аномалия",

danger:"HIGH",

status:"НАБЛЮДЕНИЕ",

description:
"Неизвестная аномальная зона. Воздействует на организм и вызывает мутации."

},



{

id:"AS-003",

name:"Город Нова",

type:"Локация",

danger:"MEDIUM",

status:"ЧАСТИЧНО ИССЛЕДОВАН",

description:
"Заброшенный мегаполис. Один из крупнейших центров заражения."

},



{

id:"AS-004",

name:"Доктор Морозов",

type:"NPC",

danger:"LOW",

status:"ЖИВОЙ",

description:
"Учёный, занимающийся исследованием происхождения вируса."

},



{

id:"AS-005",

name:"Военный Альянс",

type:"Фракция",

danger:"MEDIUM",

status:"АКТИВНА",

description:
"Организация выживших военных, контролирующая несколько укреплённых баз."

},



{

id:"AS-006",

name:"Мясник",

type:"Заражённый",

danger:"CRITICAL",

status:"ОПАСЕН",

description:
"Огромный мутант с повышенной выносливостью."

}


];



/* ========================================= */
/* СОЗДАНИЕ КАРТОЧЕК */
/* ========================================= */


function initArchive(){


const grid =
document.getElementById("archiveGrid");


if(!grid) return;



grid.innerHTML="";



archiveFiles.forEach(file=>{


grid.innerHTML += `


<article class="archive-card">


<span class="archive-id">

${file.id}

</span>


<span class="archive-type">

${file.type}

</span>



<h3>

${file.name}

</h3>



<p>

${file.description}

</p>



<div class="status">

${file.status}

</div>


<div class="threat threat-${file.danger.toLowerCase()}">

УРОВЕНЬ:
${file.danger}

</div>



</article>


`;


});


}



/* ========================================= */
/* ПОИСК */
/* ========================================= */


function initArchiveSearch(){


const input =
document.getElementById("searchInput");

if(!input) return;



input.addEventListener("input",()=>{


const value =
input.value.toLowerCase();



const cards =
document.querySelectorAll(".archive-card");



cards.forEach(card=>{


if(card.textContent
.toLowerCase()
.includes(value)){


card.style.display="block";


}

else{


card.style.display="none";


}



});


});



}





/* ========================================= */
/* ФИЛЬТРЫ */
/* ========================================= */


function initArchiveFilters(){


const buttons =
document.querySelectorAll(".filter");


if(!buttons.length) return;



buttons.forEach(button=>{


button.addEventListener("click",()=>{


buttons.forEach(btn=>

btn.classList.remove("active")

);



button.classList.add("active");



const type =
button.dataset.type;



const cards =
document.querySelectorAll(".archive-card");



cards.forEach((card,index)=>{


if(type==="all"){


card.style.display="block";


}

else{


if(archiveFiles[index].type===type){


card.style.display="block";


}

else{


card.style.display="none";


}


}



});


});



});


}



/* ========================================= */
/* СЛУЧАЙНОЕ ДОСЬЕ */
/* ========================================= */


function initRandomArchive(){


const title =
document.getElementById("randomTitle");


const text =
document.getElementById("randomText");



if(!title || !text) return;



const file =
archiveFiles[
Math.floor(
Math.random()*archiveFiles.length
)
];



title.textContent =
file.id+" — "+file.name;



text.textContent =
file.description;



}



/* ========================================= */
/* DATABASE ONLINE */
/* ========================================= */


console.log(

"%cA.S.I.S DATABASE ONLINE",

"color:#39D98A;font-size:16px;font-weight:bold;"

);
