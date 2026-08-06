/*
=========================================
A.S.I.S.
Archive Survival Information System

file.js v3.0

DATABASE ARTICLE SYSTEM
ONE FOLDER VERSION
=========================================
*/


document.addEventListener(
"DOMContentLoaded",
()=>{

loadFile();

});



/* ========================================= */
/* ЗАГРУЗКА ДОСЬЕ */
/* ========================================= */


async function loadFile(){


try{


const params =
new URLSearchParams(
window.location.search
);



const id =
params.get("id");



const response =
await fetch("archive.json");



const database =
await response.json();



const file =
database.find(
item=>item.id===id
);



if(!file){

showError();

return;

}




/* ОСНОВНАЯ ИНФОРМАЦИЯ */


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





/* КАРТИНКА */


const image =
document.getElementById(
"fileImage"
);



if(image && file.image){


image.src =
file.image;


image.alt =
file.name;


}






/* СТИЛЬ УГРОЗЫ */


const danger =
document.getElementById(
"fileDanger"
);



if(danger){


danger.className =
"threat threat-" +
file.danger.toLowerCase();


}







/* СВЯЗАННЫЕ ЗАПИСИ */


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


catch(error){


console.error(
"A.S.I.S ERROR:",
error
);


}



}






/* ========================================= */
/* УСТАНОВКА ТЕКСТА */
/* ========================================= */


function setText(
id,
value
){


const element =
document.getElementById(id);



if(element){

element.textContent =
value || "Нет данных";

}


}







/* ========================================= */
/* СВЯЗАННЫЕ ЗАПИСИ */
/* ========================================= */


function loadRelated(
database,
current
){


const box =
document.getElementById(
"relatedFiles"
);



if(!box)
return;



const related =
database.filter(
item=>

item.type === current.type

&&

item.id !== current.id

);




box.innerHTML = "";




if(related.length === 0){


box.innerHTML =

`
<p>
Связанные записи отсутствуют.
</p>
`;

return;


}





related.forEach(item=>{


box.innerHTML +=


`

<a

class="related-card"

href="file.html?id=${item.id}"

>


<span>

${item.id}

</span>


<h3>

${item.name}

</h3>


<p>

${item.type}

</p>


</a>


`;



});



}







/* ========================================= */
/* ОШИБКА */
/* ========================================= */


function showError(){


const name =
document.getElementById(
"fileName"
);



if(name){


name.textContent =
"ДОСЬЕ НЕ НАЙДЕНО";


}



console.error(

"A.S.I.S FILE NOT FOUND"

);



}
