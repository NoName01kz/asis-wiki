/*
=========================================
A.S.I.S.
Archive Survival Information System
encyclopedia.js v1.1
=========================================
*/


document.addEventListener("DOMContentLoaded", () => {


    initArchive();

    initArchiveSearch();

    initArchiveFilters();

});



/* ========================================= */
/* БАЗА АРХИВА */
/* ========================================= */


const archiveFiles = [


{
id:"AS-001",
name:"Пожиратель",
type:"Заражённый",
danger:"CRITICAL",
status:"АКТИВЕН",
description:
"Один из самых опасных заражённых объектов A.S.I.S."
},


{
id:"AS-002",
name:"Красный туман",
type:"Аномалия",
danger:"HIGH",
status:"НАБЛЮДЕНИЕ",
description:
"Неизвестная аномальная зона с опасным воздействием."
},


{
id:"AS-003",
name:"Город Нова",
type:"Локация",
danger:"MEDIUM",
status:"ИССЛЕДУЕТСЯ",
description:
"Заброшенный город после глобальной катастрофы."
},


{
id:"AS-004",
name:"Доктор Морозов",
type:"NPC",
danger:"LOW",
status:"ЖИВОЙ",
description:
"Исследователь происхождения вируса."
},


{
id:"AS-005",
name:"Военный Альянс",
type:"Фракция",
danger:"MEDIUM",
status:"АКТИВНА",
description:
"Организация выживших военных."
},


{
id:"AS-006",
name:"Мясник",
type:"Заражённый",
danger:"CRITICAL",
status:"ОПАСЕН",
description:
"Крупный мутант с высокой устойчивостью."
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


<article class="archive-card"
data-type="${file.type}">


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



<a 
href="file.html?id=${file.id}"
class="button primary"
style="margin-top:20px">


ОТКРЫТЬ ДОСЬЕ


</a>



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



document
.querySelectorAll(".archive-card")
.forEach(card=>{


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


buttons.forEach(btn=>{

btn.classList.remove("active");

});


button.classList.add("active");



const type =
button.dataset.type;



document
.querySelectorAll(".archive-card")
.forEach((card,index)=>{


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





console.log(

"%cA.S.I.S ARCHIVE ONLINE",

"color:#39D98A;font-size:18px;font-weight:bold;"

);
