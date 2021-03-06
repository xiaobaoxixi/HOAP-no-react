"use strict";

let newAnimal = false;
let loaded = false;

function initAdmin() {
  displayAnimals();

  /*--------------------------------------
  Intersection observer on the admin page
  ---------------------------------------*/

  //get sections from the DOM
  const dailyTasksSection = document.querySelector(".animalTasks");
  const toDoListSection = document.querySelector(".otherToDo");
  const dailyTasksAnchor = document.querySelector("aside ul li:nth-child(1) a");
  const postAndNotifySection = document.querySelector(".postBtn");
  const postAndNotifyAnchor = document.querySelector(
    "aside ul li:nth-child(2) a"
  );
  const statusSection = document.querySelector(".listOfDonations");
  const statusAnchor = document.querySelector("aside ul li:nth-child(3) a");

  let options0 = {
    root: null,
    rootMargin: "0px",
    threshold: 0
  };
  let options20 = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2
  };
  let observerDailyTasks = new IntersectionObserver(showDailyTask, options0);
  let observerToDoList = new IntersectionObserver(showDailyTask, options20);
  let observerPostNotify = new IntersectionObserver(showPostNotify, options20);
  let observerStatus = new IntersectionObserver(showStatus, options20);

  observerDailyTasks.observe(dailyTasksSection);
  observerToDoList.observe(toDoListSection);
  observerPostNotify.observe(postAndNotifySection);
  observerStatus.observe(statusSection);

  function showDailyTask() {
    dailyTasksAnchor.classList.add("activeAnchor");
    postAndNotifyAnchor.classList.remove("activeAnchor");
    statusAnchor.classList.remove("activeAnchor");
  }
  function showPostNotify() {
    dailyTasksAnchor.classList.remove("activeAnchor");
    postAndNotifyAnchor.classList.add("activeAnchor");
    statusAnchor.classList.remove("activeAnchor");
  }
  function showStatus() {
    dailyTasksAnchor.classList.remove("activeAnchor");
    postAndNotifyAnchor.classList.remove("activeAnchor");
    statusAnchor.classList.add("activeAnchor");
    if (newAnimal) {
      calcAnimalCost();
      countAnimals();
    }
    if (!loaded) {
      calcAnimalCost();
      countAnimals();
      getMemberStatus();
    }
  }
}

// html elements
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
const uploadBtnAdmin = document.querySelector("#uploadBtnAdmin");
const donorName = document.querySelector("#memberName");
const moneyDonation = document.querySelector("#moneyDonation");
const timeDonation = document.querySelector("#timeDonation");
const stuffDonation = document.querySelector("#stuffDonated");
const membersTamplate = document.querySelector(".membersTemplate").content;

// date related
const today = new Date();
const year = today.getFullYear().toString();
const month =
  today.getMonth() + 1 > 9
    ? (today.getMonth() + 1).toString()
    : "0" + (today.getMonth() + 1).toString();
const day =
  today.getDate() + 1 > 9
    ? today.getDate().toString()
    : "0" + (today.getDate() + 1).toString();
//const timestamp = today.getTime();
date.textContent = `${year}-${month}-${day}`;

// custom variables
let filename;
let file;
// displayed animal array, use this for update animal list without re-render the whole list AND without using firebases's built-in onchange function
let animalArray = [];

// GET animals from db and generate animal columns
function displayAnimals() {
  const displayedAnimal = document.querySelectorAll(".columns .column");
  displayedAnimal.forEach(a => {
    animalArray.push(a.dataset.id);
  });
  db.collection("animals")
    //    .orderBy("timestamp")
    .get()
    .then(res => {
      res.docs.forEach(doc => {
        if (animalArray.indexOf(doc.id) < 0) {
          // only add animal column when it's not already displayed
          buildAnimalColumn(doc);
        }
      });
    });
}

// build column of each animal
function buildAnimalColumn(entry) {
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
  if (entry.data().file !== undefined && entry.data().file !== "") {
    animalImage.src = entry.data().file;
    // let animalImageName = entry.data().file;
    // let storage = firebase.storage();
    // let storageReference = storage.ref();
    // let childRef = storageReference.child(`admin/${animalImageName}`);
    // console.log(animalImageName);
    // childRef
    //   .getDownloadURL()
    //   .then(function(url) {
    //     animalImage.src = url;
    //   })
    //   .catch(function(error) {
    //     console.log(error);
    //     animalImage.src = "img/animals/default.png";
    //   });
  } else {
    animalImage.src = "img/animals/newcomer.png";
  }
  animalImage.setAttribute("title", animalName);
  animalImageDiv.appendChild(animalImage);
  column.appendChild(animalImageDiv);
  // get daily task of this animal from another collection in database
  db.collection("dailyTaskTemplate")
    .where("animalID", "==", animalID)
    .get()
    .then(res => {
      res.docs.forEach(doc => {
        if (!doc.data().month && !doc.data().year && !doc.data().day) {
          ///////////////////// need to DRY these
          if (doc.data().morning === false) {
            let row = document.createElement("div");
            row.classList.add("row");
            row.classList.add("noTask");
            // let noTaskImage = document.createElement("img");
            // noTaskImage.setAttribute("src", "img/notask.png");
            // row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let taskCheckbox = document.createElement("input");
            taskCheckbox.setAttribute("type", "checkbox");
            let byWhom = document.createElement("span");
            byWhom.classList.add("morningByWhom");
            byWhom.classList.add("memberName");
            row.appendChild(taskCheckbox);
            row.appendChild(byWhom);
            column.appendChild(row);
            columns.appendChild(column);
          }
          ////////////////////////////////

          if (doc.data().afternoon === false) {
            let row = document.createElement("div");
            row.classList.add("row");
            row.classList.add("noTask");
            // let noTaskImage = document.createElement("img");
            // noTaskImage.setAttribute("src", "img/notask.png");
            // row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let taskCheckbox = document.createElement("input");
            taskCheckbox.setAttribute("type", "checkbox");
            let byWhom = document.createElement("span");
            byWhom.classList.add("afternoonByWhom");
            byWhom.classList.add("memberName");
            row.appendChild(taskCheckbox);
            row.appendChild(byWhom);
            column.appendChild(row);
            columns.appendChild(column);
          }

          /////////////////////////////
          if (doc.data().evening === false) {
            let row = document.createElement("div");
            row.classList.add("row");
            row.classList.add("noTask");
            // let noTaskImage = document.createElement("img");
            // noTaskImage.setAttribute("src", "img/notask.png");
            // row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let taskCheckbox = document.createElement("input");
            taskCheckbox.setAttribute("type", "checkbox");
            let byWhom = document.createElement("span");
            byWhom.classList.add("eveningByWhom");
            byWhom.classList.add("memberName");
            row.appendChild(taskCheckbox);
            row.appendChild(byWhom);
            column.appendChild(row);
            columns.appendChild(column);
          }
          /////////////////////////////
          if (doc.data().training === false) {
            let row = document.createElement("div");
            row.classList.add("row");
            row.classList.add("noTask");
            // let noTaskImage = document.createElement("img");
            // noTaskImage.setAttribute("src", "img/notask.png");
            // row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let taskCheckbox = document.createElement("input");
            taskCheckbox.setAttribute("type", "checkbox");
            let byWhom = document.createElement("span");
            byWhom.classList.add("trainingByWhom");
            byWhom.classList.add("memberName");
            row.appendChild(taskCheckbox);
            row.appendChild(byWhom);
            column.appendChild(row);
            columns.appendChild(column);
          }
          /////////////////////////////
          if (doc.data().extra === "") {
            let row = document.createElement("div");
            row.classList.add("row");
            row.classList.add("noTask");
            // let noTaskImage = document.createElement("img");
            // noTaskImage.setAttribute("src", "img/notask.png");
            // row.appendChild(noTaskImage);
            column.appendChild(row);
            columns.appendChild(column);
          } else {
            let row = document.createElement("div");
            row.classList.add("row");
            let extraDesc = document.createElement("p");
            extraDesc.textContent = doc.data().extra;
            let taskCheckbox = document.createElement("input");
            taskCheckbox.style.display = "none"; // bad solution
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
        db.collection("dailyTasks")
          .where("animalID", "==", doc.data().animalID)
          .where("year", "==", year)
          .where("month", "==", month)
          .where("day", "==", day)
          .get()
          .then(res => {
            res.forEach(doc => {
              const user = doc.data().user;
              const morning = doc.data().morning;
              const afternoon = doc.data().afternoon;
              const evening = doc.data().evening;
              const training = doc.data().training;
              if (morning) {
                document.querySelector(
                  `div[data-id="${animalID}"] .morningByWhom`
                ).textContent = user;
              }
              if (afternoon) {
                document.querySelector(
                  `div[data-id="${animalID}"] .afternoonByWhom`
                ).textContent = user;
              }
              if (evening) {
                document.querySelector(
                  `div[data-id="${animalID}"] .eveningByWhom`
                ).textContent = user;
              }
              if (
                training &&
                document.querySelector(
                  `div[data-id="${animalID}"] .trainingByWhom`
                )
              ) {
                document.querySelector(
                  `div[data-id="${animalID}"] .trainingByWhom`
                ).textContent = user;
              }
            });
          });
      });
    });
  // add listener to newly built column
  column.querySelector(".animalImage").addEventListener("click", e => {
    const clickedID = e.target.parentElement.dataset.id;
    getAnimalInfo(clickedID);
    if (animalDetailModal.classList.contains("hide")) {
      animalDetailModal.classList.remove("hide");
    }
  });
  columns.appendChild(column);
}

// show add animal panel
addAnimalBtn.addEventListener("click", showAddAnimalForm);
function showAddAnimalForm() {
  addAnimalPanel.classList.toggle("hide");
}
// addToDoBtn.addEventListener("click", addToDo);
// function addToDo() {
//   console.log("add a to do to the list");
// }

// get image file
uploadBtnAdmin.addEventListener("change", getFilename);
function getFilename(evt) {
  filename = evt.target.value.split(/(\\|\/)/g).pop();
  file = evt.target.files[0];
  console.log(filename);
}

//add animal to db, including image file
addAnimalForm.addEventListener("submit", e => {
  newAnimal = true;
  e.preventDefault();
  //add to the specific collection in firestore
  db.collection("animals")
    .add({
      //      timestamp: timestamp,
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
      //      file: addAnimalForm.filename.value
    })
    .then(docRef => {
      const newlyAddedAnimalID = docRef.id;
      db.collection("dailyTaskTemplate").add({
        animalID: newlyAddedAnimalID,
        // year: year,
        // month: month,
        // day: day,
        morning: addAnimalForm.morning.checked ? true : false,
        afternoon: addAnimalForm.afternoon.checked ? true : false,
        evening: addAnimalForm.evening.checked ? true : false,
        training: addAnimalForm.training.checked ? true : false,
        extra: addAnimalForm.extra.value || ""
      });
      resetForm(addAnimalForm);
      // re run displayAnimals to update columns
      displayAnimals();
      // upload file to the firebase storage
      let storageRef = firebase.storage().ref("admin/" + filename);
      //upload file
      let task = storageRef.put(file);
    });
});
// get animal info and display in animal detail modal
function getAnimalInfo(id) {
  db.collection("animals")
    .doc(id)
    .get()
    .then(res => {
      showAnimalDetail(res.data(), id, animalDetailModal, true);
    });
}

// edit animal detail
editAnimalBtn.addEventListener("click", e => {
  newAnimal = true;
  //  e.stopPropagation();
  let id = e.target.parentElement.parentElement.getAttribute("data-id");
  db.collection("animals")
    .doc(id)
    .update({
      name: animalDetailForm.name.value,
      breed: animalDetailForm.breed.value,
      age: animalDetailForm.age.value,
      story: animalDetailForm.story.value,
      gender: animalDetailForm.gender.value,
      size: animalDetailForm.size.value,
      money: animalDetailForm.money.value,
      young: animalDetailForm.young.checked ? true : false,
      pregnant: animalDetailForm.pregnant.checked ? true : false
    });
  // update dailytasks db
  db.collection("dailyTaskTemplate")
    .where("animalID", "==", id)
    .get()
    .then(res => {
      res.forEach(doc => {
        const docID = doc.id;
        db.collection("dailyTaskTemplate")
          .doc(docID)
          .update({
            morning: animalDetailForm.morning.checked ? true : false,
            afternoon: animalDetailForm.afternoon.checked ? true : false,
            evening: animalDetailForm.evening.checked ? true : false,
            training: animalDetailForm.training.checked ? true : false,
            extra: animalDetailForm.extra.value
          });
      });
    });
  // delete currently displayed column and add a new column with updated info
  document.querySelector(`.column[data-id='${id}']`).remove();
  db.collection("animals")
    .doc(id)
    .get()
    .then(updatedInfo => {
      buildAnimalColumn(updatedInfo);
    });
  closeModal();
});

// delete animal
deleteAnimalBtn.addEventListener("click", e => {
  newAnimal = true;
  //  e.stopPropagation();
  let id = e.target.parentElement.parentElement.getAttribute("data-id");
  db.collection("animals")
    .doc(id)
    .delete();
  closeModal();
  document.querySelector(`.column[data-id='${id}']`).remove();
});

// display animal details
let bigImage = document.createElement("img");
function showAnimalDetail(data, id, elem, editableBol) {
  const src = document
    .querySelector(`.column[data-id = "${id}"] .animalImage img`)
    .getAttribute("src");
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
  // if (editableBol === true) {
  // }
  bigImage.setAttribute("src", src);
  elem.querySelector(".animalImageBig").appendChild(bigImage);
  // display newly fetched values
  elem.querySelector(".animalName").value = data.name;
  elem.querySelector(".breed").value = data.breed;
  elem.querySelector(".age").value = data.age;
  elem.querySelector(".money").value = data.money;
  if (data.young) {
    elem
      .querySelector(`input[name='young']`)
      .setAttribute("checked", "checked");
  }
  if (data.pregnant) {
    elem
      .querySelector(`input[name='pregnant']`)
      .setAttribute("checked", "checked");
  }
  if (data.gender) {
    elem
      .querySelector(`input[value='${data.gender}']`)
      .setAttribute("checked", "checked");
  }
  // elem
  //   .querySelector(`input[value='${data.size}']`)
  //   .setAttribute("checked", "checked");
  elem.querySelector(".story-textarea").value = data.story;
  db.collection("dailyTaskTemplate")
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

function getMemberStatus() {
  // GET members details from db and generate the table of members
  let sum = 0;
  let time = 0;
  let stuff = 0;
  let maxMoneyDonation = 0;
  let maxTimeDonation = 0;
  let maxStuffDonation = 0;

  // find max of money donations
  db.collection("moneyDonation")
    .get()
    .then(res => {
      res.forEach(doc => {
        if (doc.data().amount > maxMoneyDonation) {
          maxMoneyDonation = doc.data().amount;
        }
      });
      db.collection("member")
        .get()
        .then(res => {
          res.forEach(doc => {
            const userEmail = doc.data().email;
            if (userEmail !== "admin@admin.com") {
              let clone = membersTamplate.cloneNode(true);
              clone
                .querySelector(".singleMember")
                .setAttribute("data-email", userEmail);
              clone.querySelector(".emailBox").textContent = userEmail;
              document
                .querySelector(".donationsTableContainer")
                .appendChild(clone);
              // check money donation from each user
              db.collection("moneyDonation")
                .where("userEmail", "==", userEmail)
                .get()
                .then(res => {
                  if (res.docs.length > 0) {
                    res.forEach(eachMemberDonationSum => {
                      sum = Number(eachMemberDonationSum.data().amount);
                      document.querySelector(
                        `.singleMember[data-email='${userEmail}'] #moneyDonation p`
                      ).textContent = sum + " kr.";
                      document.querySelector(
                        `.singleMember[data-email='${userEmail}'] #moneyDonation`
                      ).style.width = (100 * sum) / maxMoneyDonation + "%";
                    });
                  }
                });
            }
          });
        });
      loaded = true;
    });

  // find max of time donations
  db.collection("timeDonation")
    .get()
    .then(res => {
      res.forEach(doc => {
        if (doc.data().time > maxTimeDonation) {
          maxTimeDonation = doc.data().time;
        }
      });
      db.collection("member")
        .get()
        .then(res => {
          res.forEach(doc => {
            const userEmail = doc.data().email;
            if (userEmail !== "admin@admin.com") {
              // check money donation from each user
              db.collection("timeDonation")
                .where("userEmail", "==", userEmail)
                .get()
                .then(res => {
                  if (res.docs.length > 0) {
                    res.forEach(eachMemberDonationSum => {
                      time = Number(eachMemberDonationSum.data().time);
                      if (time === 1) {
                        document.querySelector(
                          `.singleMember[data-email='${userEmail}'] #timeDonation p`
                        ).textContent = time + " hour";
                      } else if (time > 1) {
                        document.querySelector(
                          `.singleMember[data-email='${userEmail}'] #timeDonation p`
                        ).textContent = time + " hours";
                      }
                      document.querySelector(
                        `.singleMember[data-email='${userEmail}'] #timeDonation`
                      ).style.width = (100 * time) / maxTimeDonation + "%";
                    });
                  }
                });
            }
          });
        });
    });

  // find max of stuff donations
  db.collection("member")
    .get()
    .then(res => {
      res.forEach(doc => {
        const userEmail = doc.data().email;
        if (userEmail !== "admin@admin.com") {
          db.collection("stuffDonation")
            .where("userEmail", "==", userEmail)
            .get()
            .then(res => {
              stuff = res.docs.length;
              if (stuff > maxStuffDonation) {
                maxStuffDonation = stuff;
              }
              if (stuff === 1) {
                document.querySelector(
                  `.singleMember[data-email='${userEmail}'] #stuffDonation p`
                ).textContent = stuff + " piece";
              } else if (stuff > 1) {
                document.querySelector(
                  `.singleMember[data-email='${userEmail}'] #stuffDonation p`
                ).textContent = stuff + " pieces";
              }
              document.querySelector(
                `.singleMember[data-email='${userEmail}'] #stuffDonation`
              ).style.width = (100 * stuff) / maxStuffDonation + "%";
            });
        }
      });
    });
}

// show image in 3x3 section
const imageContainer = document.querySelector(".receviedPictures");
const singlePicTemp = document.querySelector("#singlePicTemp").content;
db.collection("imagesFromAdmin")
  .get()
  .then(res => {
    res.forEach(doc => {
      if (doc.data().published === false) {
        let clone = singlePicTemp.cloneNode(true);
        let singlePicDiv = clone.querySelector(".singlePic");
        singlePicDiv.style.backgroundImage = "url('img/animals/broder.jpg')";
        singlePicDiv.setAttribute("data-file", "url('img/animals/broder.jpg')");
        imageContainer.appendChild(clone);
      }
    });
    db.collection("imagesFromMember")
      .get()
      .then(res => {
        res.forEach(doc => {
          if (doc.data().published === false) {
            let clone = singlePicTemp.cloneNode(true);
            let singlePicDiv = clone.querySelector(".singlePic");
            singlePicDiv.style.backgroundImage =
              "url('img/animals/broder.jpg')";
            imageContainer.appendChild(clone);
          }
        });
        // publish checked image (only update db, no fetching of these images on the frontpage yet)
        const publishBtn = document.querySelector(".publishBtn");
        let fileArray = [];
        publishBtn.addEventListener("click", publishImg);
        function publishImg() {
          const needToPublish = document.querySelectorAll(".singlePic");
          needToPublish.forEach(eachImage => {
            const checkbox = eachImage.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
              const needToPublishFile = eachImage.dataset.file;
              fileArray.push(needToPublishFile);
            }
          });
          //console.log(fileArray);
          // POST files to db
          fileArray.forEach(eachfile => {
            db.collection("frontpageImages")
              .add({
                filename: eachfile
              })
              .then(console.log("added to db, will be published online soon"));
          });
          // for the published files, change 'published' to true
          fileArray.forEach(eachfile => {
            db.collection("imagesFromMember")
              .where("filename", "==", eachfile)
              .get()
              .then(res => {
                res.forEach(doc => {
                  db.collection("imagesFromMember")
                    .doc(doc.id)
                    .update({
                      published: true
                    });
                });
              });

            db.collection("imagesFromAdmin")
              .where("filename", "==", eachfile)
              .get()
              .then(res => {
                res.forEach(doc => {
                  db.collection("imagesFromAdmin")
                    .doc(doc.id)
                    .update({
                      published: true
                    });
                });
              });
          });
          // clear fileArray after publish
          resetForm(imageContainer);
          // update image container // remove the ones that're just published from the container
        }
      });
  });

/**
 * status
 */
// fixed costs
const waterCost = 3000;
const elCost = 2000;
const heatCost = 3000;
const staffCost = 20000;
document.querySelector(".waterCost").textContent = waterCost;
document.querySelector(".elCost").textContent = elCost;
document.querySelector(".heatCost").textContent = heatCost;
document.querySelector(".staffCost").textContent = staffCost;
document.querySelector(".fixCost").textContent =
  waterCost + elCost + heatCost + staffCost;
// animal cost
function calcAnimalCost() {
  console.log("calc animal cost");
  newAnimal = false;
  let catCost = 0;
  let dogCost = 0;
  db.collection("animals")
    .get()
    .then(res => {
      res.forEach(doc => {
        if (doc.data().type === "cat") {
          catCost += Number(doc.data().money);
        }
      });
      document.querySelector(".catCost").textContent = catCost;
      //    document.querySelector(".totalAnimalCost").textContent = catCost + dogCost;
      db.collection("animals")
        .get()
        .then(res => {
          res.forEach(doc => {
            if (doc.data().type === "dog") {
              dogCost += Number(doc.data().money);
            }
          });
          document.querySelector(".dogCost").textContent = dogCost;
          document.querySelector(".totalAnimalCost").textContent =
            catCost + dogCost;
        });
      // donation gain is the sum of all donation made by both member and visitors what's not registered as member
      let donationGain = 0;
      let monthlyDonationGain = 0;
      db.collection("moneyDonation")
        .get()
        .then(res => {
          res.forEach(doc => {
            const eachAmount = doc.data().amount;
            donationGain += Number(eachAmount);
          });
          document.querySelector(".donationGain").textContent = donationGain;
          // monthly donation from member
          db.collection("member")
            .get()
            .then(res => {
              res.forEach(doc => {
                const monthlyDonation = doc.data().monthlyDonation;
                if (monthlyDonation) {
                  monthlyDonationGain += Number(monthlyDonation);
                }
              });
              document.querySelector(
                ".monthlyDonationGain"
              ).textContent = monthlyDonationGain;
              const result =
                monthlyDonationGain -
                waterCost -
                elCost -
                heatCost -
                staffCost -
                catCost -
                dogCost;
              document.querySelector(".result").textContent = result;
              if (result < 0) {
                document.querySelector(".hint i").textContent =
                  "didn't raise enough money this month to cover the cost, must use reserve.";
              }
            });
        });
    });
}

function countAnimals() {
  // count animals
  let catCount = 0;
  let dogCount = 0;
  let memberCount = 0;
  db.collection("animals")
    .get()
    .then(res => {
      res.forEach(doc => {
        if (doc.data().type === "cat") {
          catCount += 1;
        } else if (doc.data().type === "dog") {
          dogCount += 1;
        }
      });
      document.querySelector(".catCount").textContent = catCount;
      document.querySelector(".dogCount").textContent = dogCount;
      db.collection("member")
        .get()
        .then(res => {
          res.forEach(doc => {
            memberCount += 1;
          });
          let statisArray = [
            ["month", "cats", "dogs", "members"],
            ["Jan", 8, 7, 20],
            ["Feb", 7, 6, 18],
            ["Mar", 8, 6, 19],
            ["Apr", 8, 7, 19],
            ["May", 7, 9, 20],
            ["Jun", 7, 9, 21],
            ["Jul", 6, 6, 21],
            ["Aug", 7, 6, 22],
            ["Sep", 7, 7, 20],
            ["Oct", 8, 8, 19],
            ["Nov", 9, 8, 21]
          ];
          statisArray.push(["Dec", catCount, dogCount, memberCount]);
          document.querySelector(".memberCount").textContent = memberCount;

          // statistic chart
          // https://developers.google.com/chart/interactive/docs/gallery/linechart
          google.charts.load("current", { packages: ["corechart"] });
          google.charts.setOnLoadCallback(drawChart);
          function drawChart() {
            let data = google.visualization.arrayToDataTable(statisArray);

            let options = {
              // title: "Pets montly situation",
              curveType: "function",
              legend: { position: "bottom" },
              colors: ["#ead8a6", "#c18e63", "#74b7a5"],
              lineWidth: 3,
              chartArea: {
                left: 20,
                top: 20,
                width: "100%"
              }
            };

            let chart = new google.visualization.LineChart(
              document.getElementById("curve_chart")
            );

            chart.draw(data, options);
          }
        });
    });
}

/*-------------------------------------------
Render tasks from database into website 
--------------------------------------------*/
let taskList = document.querySelector(".toDoListWrapper");

function renderTask(doc) {
  let taskDiv = document.createElement("div");
  let task = document.createElement("span");
  let taskCheckbox = document.createElement("input");
  taskCheckbox.type = "checkbox";

  taskDiv.setAttribute("data-id", doc.id);
  if (doc.data().writer !== "admin") {
    task.textContent = "From " + doc.data().writer + ": ";
    task.classList.add("userMessage");
  }
  task.textContent += doc.data().task;
  taskDiv.appendChild(taskCheckbox);
  taskDiv.appendChild(task);
  taskList.appendChild(taskDiv);

  //deleting/completing tasks

  taskCheckbox.addEventListener("click", e => {
    //e.stopPropagation();
    let id = e.target.parentElement.getAttribute("data-id");
    db.collection("toDoList")
      .doc(id)
      .delete();
  });
}

/*-------------------------------------------
Add to-do task
------------------------------------------*/

const toDoBtn = document.querySelector(".addToDoBtn");
const toDoInput = document.querySelector(".subsectionToDo input");

toDoBtn.addEventListener("click", e => {
  e.preventDefault();
  db.collection("toDoList").add({
    task: toDoInput.value,
    writer: "admin",
    type: "To Do"
  });
  toDoInput.value = "";
});

/*-------------------------------------------
live update to-do-list
------------------------------------------*/
db.collection("toDoList").onSnapshot(snapshot => {
  let changes = snapshot.docChanges();
  //console.log(changes);
  changes.forEach(change => {
    if (change.type == "added") {
      renderTask(change.doc);
    } else if (change.type == "removed") {
      let taskDiv = taskList.querySelector("[data-id='" + change.doc.id + "']");
      taskList.removeChild(taskDiv);
    }
  });
});

/*-------------------------------------------
Post message from admin to notifications panel
------------------------------------------*/

const adminPostBtn = document.querySelector(".postBtn");
const adminPostInput = document.querySelector(".writeNotification");
const notificationForm = document.querySelector("#nofiticationAdmin");
adminPostBtn.addEventListener("click", e => {
  console.log("message posted");
  e.preventDefault();
  db.collection("notifications").add({
    text: adminPostInput.value,
    type: notificationForm.type.value,
    image: "",
    seenBy: []
  });
  adminPostInput.value = "";
});
