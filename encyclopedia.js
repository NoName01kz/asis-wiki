/*
=========================================
A.S.I.S.
Archive Survival Information System
encyclopedia.js v2.0

JSON DATABASE SYSTEM
ONE FOLDER VERSION
=========================================
*/


document.addEventListener(
"DOMContentLoaded",
()=>{

loadArchive();

initSearch();

initFilters();

});



let archive = [];



/* ========================================= */
/* ЗАГРУЗКА БАЗЫ */
/* ========================================= */


async function loadArchive(){


try{


const response =
await fetch("archive.json");



archive =
await response.json();



renderArchive(archive);



console.log(

"%cA.S.I.S ARCHIVE ONLINE",

"color:#39D98A;font-size:18px;font-weight:bold"

);



}

catch(error){


console.error(

"A.S.I.S DATABASE ERROR",

error

);


}


}





/* ========================================= */
/* СОЗДАНИЕ КАРТОЧЕК */
/* ========================================= */


function renderArchive(files){


const grid =
document.getElementById("archiveGrid");



if(!grid) return;



grid.innerHTML="";



files.forEach(file=>{


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



<div class="archive-status">

${file.status}

</div>



<div class="threat threat-${file.danger.toLowerCase()}">

ОПАСНОСТЬ:
${file.danger}

</div>



<a

href="file.html?id=${file.id}"

class="button primary">


ОТКРЫТЬ ДОСЬЕ


</a>



</article>


`;


});


}







/* ========================================= */
/* ПОИСК */
/* ========================================= */


function initSearch(){


const input =
document.getElementById("searchInput");



if(!input) return;



input.addEventListener(

"input",

()=>{


const value =
input.value.toLowerCase();



const result =
archive.filter(file=>{


return (

file.name
.toLowerCase()
.includes(value)

||

file.type
.toLowerCase()
.includes(value)

||

file.description
.toLowerCase()
.includes(value)

);


});



renderArchive(result);



}

);


}







/* ========================================= */
/* ФИЛЬТРЫ */
/* ========================================= */


function initFilters(){


const buttons =
document.querySelectorAll(".filter");



if(!buttons.length)
return;



buttons.forEach(button=>{


button.addEventListener(

"click",

()=>{


buttons.forEach(btn=>{

btn.classList.remove("active");

});



button.classList.add("active");



const type =
button.dataset.type;



if(type==="all"){


renderArchive(archive);


return;


}



const result =
archive.filter(file=>{


return file.type===type;


});



renderArchive(result);



}

);


});


}
