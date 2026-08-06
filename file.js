/*
=========================================
A.S.I.S.
Archive Survival Information System
file.js v1.0
=========================================
*/


document.addEventListener("DOMContentLoaded", () => {

    loadFile();

});



/* ========================================= */
/* БАЗА ДОСЬЕ */
/* ========================================= */


const asisFiles = {


"AS-001": {

id:"AS-001",

name:"Пожиратель",

type:"Заражённый",

danger:"CRITICAL",

status:"АКТИВЕН",

description:
"Один из самых опасных заражённых объектов A.S.I.S. Обладает повышенной скоростью, огромной физической силой и агрессивным поведением. Рекомендуется избегать прямого контакта.",

history:
"Первое обнаружение зарегистрировано в северном секторе после массового заражения. Объект уничтожил несколько разведывательных групп.",

advice:
"Не вступать в ближний бой. Использовать дистанционное оружие. Поддерживать минимальную дистанцию."


},



"AS-002": {

id:"AS-002",

name:"Красный туман",

type:"Аномалия",

danger:"HIGH",

status:"НАБЛЮДЕНИЕ",

description:
"Неизвестная аномальная область, покрытая плотным красным туманом. Воздействует на живые организмы и вызывает нестабильные мутации.",

history:
"Обнаружена экспедицией A.S.I.S. во время исследования северной зоны.",

advice:
"Использование защитного оборудования обязательно. Вход разрешён только исследовательским группам."


},



"AS-003": {

id:"AS-003",

name:"Город Нова",

type:"Локация",

danger:"MEDIUM",

status:"ЧАСТИЧНО ИССЛЕДОВАН",

description:
"Заброшенный мегаполис, который до катастрофы являлся крупнейшим городом региона.",

history:
"После начала заражения город был полностью эвакуирован. Сейчас территория контролируется заражёнными.",

advice:
"Передвижение разрешено только группам разведки."


},



"AS-004": {

id:"AS-004",

name:"Доктор Морозов",

type:"NPC",

danger:"LOW",

status:"ЖИВОЙ",

description:
"Учёный, участвующий в исследовании происхождения вируса и поиске лекарства.",

history:
"Последний контакт зарегистрирован в исследовательском комплексе Восточного сектора.",

advice:
"Объект считается дружественным. Защита обязательна."


},



"AS-005": {

id:"AS-005",

name:"Военный Альянс",

type:"Фракция",

danger:"MEDIUM",

status:"АКТИВНА",

description:
"Организация выживших военных, контролирующая укреплённые базы и проводящая операции.",

history:
"Создан после падения центрального правительства.",

advice:
"Сохранять нейтральные отношения."


}



};



/* ========================================= */
/* ЗАГРУЗКА ФАЙЛА */
/* ========================================= */


function loadFile(){


const params =
new URLSearchParams(
window.location.search
);


const id =
params.get("id");



const file =
asisFiles[id] || asisFiles["AS-001"];



const name =
document.getElementById("fileName");


const fileId =
document.getElementById("fileId");


const type =
document.getElementById("fileType");


const danger =
document.getElementById("fileDanger");


const status =
document.getElementById("fileStatus");


const description =
document.getElementById("fileDescription");


const history =
document.getElementById("fileHistory");


const advice =
document.getElementById("fileAdvice");



if(name)
name.textContent=file.name;



if(fileId)
fileId.textContent=file.id;



if(type)
type.textContent=file.type;



if(danger){

danger.textContent=file.danger;

danger.className =
"threat threat-" +
file.danger.toLowerCase();

}



if(status)
status.textContent=file.status;



if(description)
description.textContent=file.description;



if(history)
history.textContent=file.history;



if(advice)
advice.textContent=file.advice;



console.log(

"%cA.S.I.S FILE LOADED: "+file.id,

"color:#39D98A;font-weight:bold;"

);


}
