"use strict";

// html elements
const signoutAdminBtn = document.querySelector(".signoutAdmin");
const addAnimalBtn = document.querySelector(".addAnimalBtn");
const addAnimalToDbBtn = document.querySelector(".addAnimalToDB");
const addToDoBtn = document.querySelector(".addToDoBtn");
const signoutForm = document.querySelector(".signOutForm");
const addAnimalPanel = document.querySelector(".addAnimalForm");
const addAnimalForm = document.querySelector(".addAnimalForm form");
const closeX = document.querySelectorAll(".close");
const closeModalBtn = document.querySelector(".buttons .closeModal");
const editAnimalBtn = document.querySelector(".editAnimal");
const deleteAnimalBtn = document.querySelector(".deleteAnimal");
const animalDetailModal = document.querySelector(".animalDetailModal");
const animalDetailForm = document.querySelector(".animalDetails");
const date = document.querySelector(".date");
// date related
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();
const timestamp = today.getTime();
date.textContent = `${year}-${month}-${day}`;
// custom variables
// displayed animal array, use this for update animal list without re-render the whole list AND without using firebases's built-in onchange function
let animalArray = [];

window.addEventListener("DOMContentLoaded", displayAnimals);

// GET animals from db and generate animal columns
function displayAnimals() {
  const displayedAnimal = document.querySelectorAll(".columns .column");
  displayedAnimal.forEach(a => {
    animalArray.push(a.dataset.id);
  });
  db.collection("animals")
    .orderBy("timestamp")
    .get()
    .then(res => {
      res.docs.forEach(doc => {
        if (animalArray.indexOf(doc.id) < 0) {
          // only add animal column when it's not already displayed
          buildAnimalList(doc);
        }
      });
      // get triggers in the newly built animal list and open animal detail modal with click on animal image
      const allAnimalImgS = document.querySelectorAll(".animalImage");
      allAnimalImgS.forEach(a => {
        a.addEventListener("click", e => {
          const clickedID = e.target.parentElement.dataset.id;
          getAnimalInfo(clickedID);
          if (animalDetailModal.classList.contains("hide")) {
            animalDetailModal.classList.remove("hide");
          }
        });
      });
    });
}

// build column of each animal
function buildAnimalList(entry) {
  const animalName = entry.data().name;
  const animalID = entry.id;
  //  const animalImageFile = entry.data().image[0];
  const columns = document.querySelector(".tableWrapper .columns");
  let column = document.createElement("div");
  column.dataset.id = entry.id;
  column.classList.add("column");
  let animalImageDiv = document.createElement("div");
  animalImageDiv.classList.add("animalImage");
  let animalImage = document.createElement("img");
  //  animalImage.setAttribute("src", animalImageFile);
  animalImage.setAttribute("title", animalName);
  animalImageDiv.appendChild(animalImage);
  column.appendChild(animalImageDiv);
  // get daily task of this animal from another collection in database
  db.collection("dailyTasks")
    .where("animalID", "==", animalID)
    .where("month", "==", month)
    .where("day", "==", day)
    .get()
    .then(res => {
      res.docs.forEach(doc => {
        ///////////////////// need to DRY these
        if (doc.data().month === month && doc.data().day === day) {
          if (doc.data().morning === false) {
            let row = document.createElement("div");
            row.classList.add("row");
            let noTaskImage = document.createElement("img");
            noTaskImage.setAttribute("src", "img/notask.png");
            row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let taskCheckbox = document.createElement("input");
            taskCheckbox.setAttribute("type", "checkbox");
            let byWhom = document.createElement("span");
            byWhom.classList.add("memberName");
            if (doc.data().morningMember !== "") {
              byWhom.textContent = doc.data().morningMember;
            }
            row.appendChild(taskCheckbox);
            row.appendChild(byWhom);
            column.appendChild(row);
            columns.appendChild(column);
          }
          ////////////////////////////////

          if (doc.data().afternoon === false) {
            let row = document.createElement("div");
            row.classList.add("row");
            let noTaskImage = document.createElement("img");
            noTaskImage.setAttribute("src", "img/notask.png");
            row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let taskCheckbox = document.createElement("input");
            taskCheckbox.setAttribute("type", "checkbox");
            let byWhom = document.createElement("span");
            byWhom.classList.add("memberName");
            if (doc.data().morningMember !== "") {
              byWhom.textContent = doc.data().afternoonMember;
            }
            row.appendChild(taskCheckbox);
            row.appendChild(byWhom);
            column.appendChild(row);
            columns.appendChild(column);
          }

          /////////////////////////////
          if (doc.data().evening === false) {
            let row = document.createElement("div");
            row.classList.add("row");
            let noTaskImage = document.createElement("img");
            noTaskImage.setAttribute("src", "img/notask.png");
            row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let taskCheckbox = document.createElement("input");
            taskCheckbox.setAttribute("type", "checkbox");
            let byWhom = document.createElement("span");
            byWhom.classList.add("memberName");
            if (doc.data().morningMember !== "") {
              byWhom.textContent = doc.data().eveningMember;
            }
            row.appendChild(taskCheckbox);
            row.appendChild(byWhom);
            column.appendChild(row);
            columns.appendChild(column);
          }
          /////////////////////////////
          if (doc.data().training === false) {
            let row = document.createElement("div");
            row.classList.add("row");
            let noTaskImage = document.createElement("img");
            noTaskImage.setAttribute("src", "img/notask.png");
            row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let taskCheckbox = document.createElement("input");
            taskCheckbox.setAttribute("type", "checkbox");
            let byWhom = document.createElement("span");
            byWhom.classList.add("memberName");
            if (doc.data().morningMember !== "") {
              byWhom.textContent = doc.data().trainingMember;
            }
            row.appendChild(taskCheckbox);
            row.appendChild(byWhom);
            column.appendChild(row);
            columns.appendChild(column);
          }
          /////////////////////////////
          if (doc.data().extra === "") {
            let row = document.createElement("div");
            row.classList.add("row");
            let noTaskImage = document.createElement("img");
            noTaskImage.setAttribute("src", "img/notask.png");
            row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let extraDesc = document.createElement("p");
            extraDesc.textContent = doc.data().extra;
            let taskCheckbox = document.createElement("input");
            taskCheckbox.setAttribute("type", "checkbox");
            let byWhom = document.createElement("span");
            byWhom.classList.add("memberName");
            if (doc.data().extraMember !== "") {
              byWhom.textContent = doc.data().extraMember;
            }
            row.appendChild(extraDesc);
            row.appendChild(taskCheckbox);
            row.appendChild(byWhom);
            column.appendChild(row);
            columns.appendChild(column);
          }
        }
      });
    });
  columns.appendChild(column);
}

// add animal
addAnimalBtn.addEventListener("click", showAddAnimalForm);
function showAddAnimalForm() {
  addAnimalPanel.classList.toggle("hide");
}
// addToDoBtn.addEventListener("click", addToDo);
// function addToDo() {
//   console.log("add a to do to the list");
// }

// add animal to db
addAnimalForm.addEventListener("submit", e => {
  e.preventDefault();
  //add to the specific collection in firestore
  db.collection("animals")
    .add({
      timestamp: timestamp,
      name: addAnimalForm.animalName.value,
      type: addAnimalForm.type.value,
      breed: addAnimalForm.breed.value,
      age: addAnimalForm.age.value,
      gender: addAnimalForm.gender.value,
      size: addAnimalForm.size.value,
      young: addAnimalForm.young.checked ? true : false,
      pregnant: addAnimalForm.pregnant.checked ? true : false,
      money: addAnimalForm.money.value,
      story: addAnimalForm.story.value
    })
    .then(docRef => {
      const newlyAddedAnimalID = docRef.id;
      db.collection("dailyTasks").add({
        animalID: newlyAddedAnimalID,
        year: year,
        month: month,
        day: day,
        morning: addAnimalForm.morning.checked ? true : false,
        afternoon: addAnimalForm.afternoon.checked ? true : false,
        evening: addAnimalForm.evening.checked ? true : false,
        training: addAnimalForm.training.checked ? true : false,
        extra: addAnimalForm.extra.value
      });
      resetForm(addAnimalForm);
      // re run displayAnimals to update columns
      displayAnimals();
    });
});
// get animal info
function getAnimalInfo(id) {
  db.collection("animals")
    .doc(id)
    .get()
    .then(res => {
      showAnimalDetail(res.data(), id, animalDetailModal, true);
    });
}

// edit animal detail
editAnimalBtn.addEventListener("click", editAnimal);
function editAnimal() {
  console.log("edit animal, write to db");
  closeModal();
  updateAnimalList();
}
// delete animal
deleteAnimalBtn.addEventListener("click", e => {
  e.stopPropagation();
  let id = e.target.parentElement.parentElement.getAttribute("data-id");
  db.collection("animals")
    .doc(id)
    .delete();
  closeModal();
  document.querySelector(`.column[data-id=${id}]`).remove();
});

/********************
 * shared functions
 ********************/

// reset form
function resetForm(form) {
  const allFormELements = form.querySelectorAll("*");
  allFormELements.forEach(e => {
    e.value = "";
    if (e.checked) {
      e.checked = false;
    }
  });
}

// display animal details
function showAnimalDetail(data, id, elem, editableBol) {
  const currentAnimal = id;
  elem.dataset.id = id;
  // clear previous values
  const previousKeys = [
    "male",
    "female",
    "morning",
    "afternoon",
    "evening",
    "training"
  ];
  previousKeys.forEach(key => {
    elem.querySelector(`input[value='${key}']`).removeAttribute("checked");
  });
  if (editableBol === true) {
  }
  // display newly fetched values
  elem.querySelector(".animalName").value = data.name;
  elem.querySelector(".breed").value = data.breed;
  elem.querySelector(".age").value = data.age;
  elem.querySelector(`input[value='male']`).removeAttribute("checked");
  elem.querySelector(`input[value='female']`).removeAttribute("checked");
  elem
    .querySelector(`input[value='${data.gender}']`)
    .setAttribute("checked", "checked");
  elem
    .querySelector(`input[value='${data.size}']`)
    .setAttribute("checked", "checked");
  elem.querySelector(".story-textarea").value = data.story;
  db.collection("dailyTasks")
    .where("animalID", "==", id)
    .get()
    .then(res => {
      res.docs.forEach(doc => {
        if (doc.data().morning) {
          elem
            .querySelector(`input[value='morning']`)
            .setAttribute("checked", "checked");
        }
        if (doc.data().afternoon) {
          elem
            .querySelector(`input[value='afternoon']`)
            .setAttribute("checked", "checked");
        }
        if (doc.data().evening) {
          elem
            .querySelector(`input[value='evening']`)
            .setAttribute("checked", "checked");
        }
        if (doc.data().traning) {
          elem
            .querySelector(`input[value='training']`)
            .setAttribute("checked", "checked");
        }
        elem.querySelector(".extra").value = doc.data().extra;
      });
    });
}

// close panal with click on X
closeX.forEach(closePanel);
function closePanel(x) {
  x.addEventListener("click", e => {
    e.target.parentElement.classList.add("hide");
  });
}

// close modal with button click
closeModalBtn.addEventListener("click", () => {
  closeModal();
});

// click animal detail modal
function closeModal() {
  animalDetailModal.classList.add("hide");
}

// update animal list
// function updateAnimalList() {
//   console.log("update to the edited values ");
// }
