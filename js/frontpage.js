"use strict";

/*-----------------------------------------
Elements for HTML 
----------------------------------------*/
const animalListOnLoggedIn = document.querySelector("#animalList");
const eachAnimalTemp = document.querySelector("#eachAnimalTemp").content;
const petExpand = document.querySelector("#petExpand");
const detailedAnimalTemp = document.querySelector("#detailedAnimalTemp")
  .content;

/*-------------------------------------------
Initialize Firebase
------------------------------------------*/
let config = {
  apiKey: "AIzaSyBpAvUcRTsrwq5HRkRbruyxmhkhfdLbiMk",
  authDomain: "hoap-exam2018.firebaseapp.com",
  databaseURL: "https://hoap-exam2018.firebaseio.com",
  projectId: "hoap-exam2018",
  storageBucket: "hoap-exam2018.appspot.com",
  messagingSenderId: "287614156735"
};
firebase.initializeApp(config);

// make a constant to the database
const db = firebase.firestore();
const settings = {
  timestampsInSnapshots: true
};
db.settings(settings);

/*-------------------------------------------
Run init function
------------------------------------------*/

window.addEventListener("DOMContentLoaded", init);

function init() {
  const adminSection = document.querySelector("#admin");

  /*------------------------------------------
sign in user
------------------------------------------*/
  //const for signin
  const signipEmail = document.querySelector("#signipEmail");
  const signipPassword = document.querySelector("#signipPassword");
  const signinButton = document.querySelector("#signinButton");

  //sign in a new user
  signinButton.addEventListener("click", e => {
    e.preventDefault();

    firebase
      .auth()
      .signInWithEmailAndPassword(signipEmail.value, signipPassword.value)
      .then(() => {
        console.log("Succesfull signed in");
      })
      .catch(function(error) {
        console.log(error);
      });
  });

  /*-------------------------------------------
Display signin form
------------------------------------------*/

  let alreadyMemberBtn = document.querySelector("#alreadyMemberBtn");
  let signinForm = document.querySelector("#loginForm");
  alreadyMemberBtn.addEventListener("click", openSigninForm);

  function openSigninForm() {
    if (signinForm.style.display == "block") {
      signinForm.style.display = "none";
    } else {
      signinForm.style.display = "block";
    }
  }

  /*-------------------------------------------
Display right content if user
------------------------------------------*/

  const frontpageContent = document.querySelector("#frontpageContent");
  const signedInContent = document.querySelector("#signedInContent");
  const memberBtns = document.querySelector("#sidebarBtns");
  const signoutAdminBtn = document.querySelector("#signoutAdmin");
  const footer = document.querySelector("#footer");

  firebase.auth().onAuthStateChanged(function(user) {
    if (user && user.email === "admin@admin.com") {
      adminSection.style.display = "block";
      frontpageContent.style.display = "none";
      signedInContent.style.display = "none";
      signinForm.style.display = "none";
      alreadyMemberBtn.style.display = "none";
      memberBtns.style.display = "none";
      signoutAdminBtn.style.display = "block";
      footer.style.display = "none";
      db.collection("toDoList")
        .get()
        .then(showTasks => {
          showTasks.docs.forEach(doc => {
            //renderTask(doc);
          });
        });
    } else if (user) {
      adminSection.style.display = "none";
      frontpageContent.style.display = "none";
      signedInContent.style.display = "block";
      signinForm.style.display = "none";
      alreadyMemberBtn.style.display = "none";
      memberBtns.style.display = "block";
      signoutAdminBtn.style.display = "none";
      buildAnimalListOnLoggedinPage();
    } else {
      adminSection.style.display = "none";
      frontpageContent.style.display = "block";
      signedInContent.style.display = "none";
      alreadyMemberBtn.style.display = "block";
      memberBtns.style.display = "none";
      signoutAdminBtn.style.display = "none";
      footer.style.display = "grid";
    }
  });

  /*-------------------------------------------
Signout user
------------------------------------------*/

  const signOutButton = document.querySelector("#signOut");
  signoutAdminBtn.addEventListener("click", signout);
  signOutButton.addEventListener("click", signout);
  function signout() {
    firebase
      .auth()
      .signOut()
      .then(function() {
        console.log("Succesfull logout");
      })
      .catch(function(error) {
        // An error happened.
        console.log(err);
      });
  }

  /*-------------------------------------------
Sign up user
------------------------------------------*/
  const signupName = document.querySelector("#signupName");
  const signupPassword = document.querySelector("#signupPassword");
  const signupEmail = document.querySelector("#signupEmail");
  const signupBtn = document.querySelector("#signupBtn");

  signupBtn.addEventListener("click", e => {
    e.preventDefault();

    //go to preferences page

    firebase
      .auth()
      .createUserWithEmailAndPassword(signupEmail.value, signupPassword.value)
      .then(() => {
        console.log("Succesfull signup");

        db.collection("member").add({
          email: signupEmail.value,
          nickname: signupName.value,
          permission: "none"
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  });

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
    task.textContent = doc.data().task;

    taskDiv.appendChild(taskCheckbox);
    taskDiv.appendChild(task);
    taskList.appendChild(taskDiv);

    //deleting/completing tasks

    taskCheckbox.addEventListener("click", e => {
      e.stopPropagation();
      let id = e.target.parentElement.getAttribute("data-id");
      db.collection("toDoList")
        .doc(id)
        .delete();
    });
  }

  /*-------------------------------------------
                Add to do task
------------------------------------------*/

  const toDoBtn = document.querySelector(".addToDoBtn");
  const toDoInput = document.querySelector(".subsectionHeader span input");

  toDoBtn.addEventListener("click", e => {
    console.log("hello");
    e.preventDefault();
    db.collection("toDoList").add({
      task: toDoInput.value,
      writer: "admin",
      type: "To Do"
    });
    toDoInput.value = "";
  });

  /*-------------------------------------------
               live updates
------------------------------------------*/
  db.collection("toDoList").onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    //console.log(changes);
    changes.forEach(change => {
      if (change.type == "added") {
        renderTask(change.doc);
      } else if (change.type == "removed") {
        let taskDiv = taskList.querySelector(
          "[data-id='" + change.doc.id + "']"
        );
        taskList.removeChild(taskDiv);
      }
    });
  });

  /*-------------------------------------------
Animation - Intersection Observer
------------------------------------------*/

  const animatedSection = document.querySelector("#aboutUs");

  let observer = new IntersectionObserver(entry => {
    if (entry.intersectionRatio > 0) {
      console.log("in view");
    } else {
      console.log("out of view");
    }
  });

  observer.observe(animatedSection);
  /*-------------------------------------------
Upload an image to database
------------------------------------------*/

  //get elements
  const uploader = document.querySelector("#uploader");
  const fileButton = document.querySelector("#fileButton");

  //listen for file selection

  fileButton.addEventListener("change", function(e) {
    //get file
    let file = e.target.files[0];

    // document.querySelector('input[type="file"]').value.split(/(\\|\/)/g).pop();
    //https://forums.asp.net/t/2027451.aspx?How%20to%20get%20file%20name%20selected%20in%20input%20type%20file%20&fbclid=IwAR1q1NmUJszE3bNt4Pn9tbY068Q9x4A2Ar2sWA39Tep5CUrpY2FdiTh5DA8

    //create a storage ret
    let storageRef = firebase.storage().ref("animals/" + file.name);

    //upload file
    let task = storageRef.put(file);

    // update progress bar
    task.on(
      "state_changed",
      function progress(snapshot) {
        let percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      function error(err) {},
      function complete() {
        console.log("picture is uploaded");
      }
    );
  });

  //create a reference with an initial file path and name
  /* let storage = firebase.storage();
  let storageReference = storage.ref();
  let childRef = storageReference.child("animals/dog-cute-pet.jpg");

  childRef
    .getDownloadURL()
    .then(function(url) {
      let testImage = url;
      document.querySelector("#testImage img").src = testImage;
    })
    .catch(function(error) {
      // Handle any errors
    });
*/
  /*-------------------------------------------
Open Modal
------------------------------------------*/
  /*let inputfield = document.querySelectorAll("input");
let label = document.querySelectorAll("label");

inputfield.forEach(inputfield => {
  if (inputfield.placeholder !== "") {
    console.log("there is something");
  } else {
    console.log("there is nothing");
  }
});

*/
}

function buildAnimalListOnLoggedinPage() {
  db.collection("animals")
    .get()
    .then(res => {
      res.docs.forEach(doc => {
        const clone = eachAnimalTemp.cloneNode(true);

        clone.querySelector(".animalName").textContent = doc.data().name;
        clone.querySelector(".eachAnimal").setAttribute("data-id", doc.id);

        animalListOnLoggedIn.appendChild(clone);
      });
      const allIndividualAnimalS = document.querySelectorAll(".eachAnimal");
      allIndividualAnimalS.forEach(a => {
        a.addEventListener("click", e => {
          const clickedAnimalID = e.target.dataset.id;
          db.collection("animals")
            .doc(clickedAnimalID)
            .get()
            .then(res => {
              petExpand.style.display = "block";
              cloneAnimalInfo(res.data());
              console.log(res.data().name);
            });
        });
      });
    });
}

function openAnimalInfo(e) {
  alert();
  console.log(e.target.dataset.id);
}
function cloneAnimalInfo(data) {
  petExpand.innerHTML = "";
  const clone = detailedAnimalTemp.cloneNode(true);

  clone.querySelector(".animalName").textContent = data.name;
  clone.querySelector(".animalBreed").textContent = data.breed;
  clone.querySelector(".animalAge").textContent = data.age;
  clone.querySelector(".animalGender").textContent = data.gender;
  clone.querySelector(".animalSize").textContent = data.size;
  if (!data.young) {
    clone.querySelector(".animalPup").style.display = "none";
  }
  if (!data.pregnant) {
    clone.querySelector(".animalPregnant").style.display = "none";
  }
  clone.querySelector(".animalStory").textContent = data.story;
  clone.querySelector(".money").textContent = data.money;
  clone.querySelector(".name").textContent = data.name;

  petExpand.appendChild(clone);
}
