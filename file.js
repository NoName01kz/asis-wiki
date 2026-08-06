/*
=========================================
A.S.I.S.
Archive Survival Information System
file.js v2.0
JSON DATABASE SYSTEM
ONE FOLDER VERSION
=========================================
*/


document.addEventListener(
"DOMContentLoaded",
loadFile
);



async function loadFile(){


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
item => item.id === id
);



if(!file){

console.error(
"A.S.I.S FILE NOT FOUND"
);

return;

}




document.getElementById("fileName")
.textContent =
file.name;



document.getElementById("fileId")
.textContent =
file.id;



document.getElementById("fileType")
.textContent =
file.type;



document.getElementById("fileStatus")
.textContent =
file.status;



document.getElementById("fileDescription")
.textContent =
file.description;



document.getElementById("fileHistory")
.textContent =
file.history;



document.getElementById("fileAdvice")
.textContent =
file.advice;




const danger =
document.getElementById("fileDanger");



danger.textContent =
file.danger;



danger.className =
"threat threat-" +
file.danger.toLowerCase();



console.log(

"%cA.S.I.S DATABASE CONNECTED",

"color:#39D98A;font-weight:bold"

);



console.log(
"Loaded:",
file.id
);



}
