"use strict";

const alwaysSub = ["other", "urgent"];
let currentSub = [];
currentSub = alwaysSub;
const user = {
  userEmail: "",
  subscribe: currentSub
};

let newsStatus = false;
let onlyFollow = false;
let onlyCat = false;
let onlyDog = false;
/*-----------------------------------------
Elements for HTML 
----------------------------------------*/

const animalListOnLoggedIn = document.querySelector("#animalList");
const eachAnimalTemp = document.querySelector("#eachAnimalTemp").content;
const petExpand = document.querySelector("#petExpand");
const adminSection = document.querySelector("#admin");
const newsFeedPanel = document.querySelector("#newsFeed");
const newsFeedContent = document.querySelector("#newsFeed .newsFeedContent");
const userSettingPanel = document.querySelector("#userSettings");
const donationStatus = document.querySelector("#donationStatus");
const userSettingForm = userSettingPanel.querySelector("form");
const oneTimeDonationForm = document.querySelector("#oneTimeDonation");
const signupForm = document.querySelector("#signupForm");
const subscribeForm = document.querySelector("#subscribeForm form");
const messageForm = document.querySelector("#messageForm form");
const prefModal = document.querySelector("#preferencesModal");
const preferenceForm = document.querySelector("#preferencesModal form");
const detailedAnimalTemp = document.querySelector("#detailedAnimalTemp")
  .content;
const donationTemp = document.querySelector("#memberDonation").content;
/////////////////////////////
const frontpageContentS = document.querySelectorAll(".frontpageContent");
const userContentS = document.querySelectorAll(".userContent");
const adminContentS = document.querySelectorAll(".adminContent");
const closeByDefaultContents = document.querySelectorAll(".closeByDefault");
const feedbackMsgS = document.querySelectorAll(".feedbackMsg");
/////////////////////////////
let loginForm = document.querySelector("#loginForm");
const signoutAdminBtn = document.querySelector("#signoutAdmin");
const signOutButton = document.querySelector("#signOut");
const stuffDonationForm = document.querySelector("#stuffDonationForm form");

const statusCircle = document.querySelector(".statusCircle");
const onlyCatFilter = document.querySelector(".onlyCat");
const onlyDogFilter = document.querySelector(".onlyDog");
const followFilter = document.querySelector(".following");

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
// config database in firestore
const db = firebase.firestore();
const settings = {
  timestampsInSnapshots: true
};
db.settings(settings);
// reference to storage in firebase
let storage = firebase.storage();
let storageReference = storage.ref();

/*-------------------------------------------
Start
------------------------------------------*/
hideArrayElements(adminContentS);
window.addEventListener("DOMContentLoaded", init);
function init() {
  // Display right content based on if user is logged in and if user is admin
  pickContent();
  // listen to user actions
  addStaticListeners();
}

function pickContent() {
  //// with firebase Auth
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      db.collection("member")
        .where("email", "==", user.email)
        .get()
        .then(res => {
          res.docs.forEach(entry => {
            const permission = entry.data().permission;
            if (permission === "admin") {
              // display relevant content when admin is logged in
              hideArrayElements(frontpageContentS);
              hideArrayElements(userContentS);
              showArrayElements(adminContentS);
              // get relevant user data
              initAdmin();
            } else {
              hideArrayElements(frontpageContentS);
              hideArrayElements(adminContentS);
              hideArrayElements(closeByDefaultContents);
              showArrayElements(userContentS);
              /*-------------------------
                live update notification
                -------------------------*/
              db.collection("notifications").onSnapshot(snapshot => {
                console.log("monitor notification for: " + user.email);
                let changes = snapshot.docChanges();
                changes.forEach(change => {
                  if (change.type == "added") {
                    const changedDoc = change.doc.data();
                    if (
                      changedDoc.seenBy &&
                      !changedDoc.seenBy.includes(user.email)
                    ) {
                      newsStatus = true;
                      console.log("new notification added");
                      toggleElements(statusCircle);
                      if (!statusCircle.classList.contains("flash")) {
                        statusCircle.classList.add("flash");
                        statusCircle.addEventListener("animationend", () => {
                          statusCircle.classList.remove("flash");
                        });
                      }
                      setTimeout(() => {
                        statusCircle.classList.remove("flash");
                      }, 5000);
                      // by default, new notification doesn't trigger getUserNewsfeed(), it's triggered when user click on the paw
                      // but if the news panel is already open, need to run getUserNewsfeed(), since user won't click on paw at this state
                      if (newsFeedPanel.classList.contains("shownContent")) {
                        console.log("already open");
                        getUserNewsfeed(
                          window.sessionStorage.getItem("subscribe")
                        );
                        toggleElements(statusCircle);
                        newsStatus = false;
                      }
                    }
                  }
                });
              });
            }
          });
        });
      /*} else if (user) {
          if (user && user.email === "admin@admin.com") {
      // display relevant content when admin is logged in
      hideArrayElements(frontpageContentS);
      hideArrayElements(userContentS);
      showArrayElements(adminContentS);
      // get relevant user data
      initAdmin();
    } */
      // display relevant content for logged in user
      // hideArrayElements(frontpageContentS);
      // hideArrayElements(adminContentS);
      // hideArrayElements(closeByDefaultContents);
      // showArrayElements(userContentS);
    } else {
      // display relevant content when no user is logged in
      hideArrayElements(adminContentS);
      hideArrayElements(userContentS);
      showArrayElements(frontpageContentS);
    }
  });
  //// with browser session
  //// use session as a medium to pass info with page reload
  //// signin and signup will lead to startUserSession
  if (window.sessionStorage.getItem("userEmail")) {
    console.log("from session");
    hideArrayElements(adminContentS);
    const userEmail = window.sessionStorage.getItem("userEmail");
    const subscribe = window.sessionStorage.getItem("subscribe");
    if (userEmail !== "admin@admin.com") {
      user.userEmail = userEmail;
      user.subscribe = subscribe;
      getUserSetting(userEmail);
      //    getUserNewsfeed(subscribe);
      getUserDonationSofar(userEmail);
      getUserAnimals(userEmail);
    }
  }
}

function addStaticListeners() {
  // user interaction on logged-in page
  const settingBtn = document.querySelector("#settingBtn");
  settingBtn.addEventListener("click", () => {
    getUserDonationSofar(window.sessionStorage.getItem("userEmail"));
    toggleElements(userSettingPanel, newsFeedPanel);
  });

  const newsBtn = document.querySelector("#newsBtn");
  newsBtn.addEventListener("click", () => {
    if (statusCircle.classList.contains("shownContent")) {
      toggleElements(statusCircle);
    }
    toggleElements(newsFeedPanel, userSettingPanel);
    if (newsStatus === true) {
      getUserNewsfeed(user.subscribe);
    }
  });

  const clearNotification = document.querySelector(".clearNotification");
  clearNotification.addEventListener("click", markAllRead);

  const cancelMembershipBtn = document.querySelector("#cancelMembership");
  cancelMembershipBtn.addEventListener("click", cancelMembership);

  messageForm.addEventListener("submit", sendMessage);
  stuffDonationForm.addEventListener("submit", stuffDonate);

  // user interaction on frontpage
  let alreadyMemberBtn = document.querySelector("#alreadyMemberBtn");
  alreadyMemberBtn.addEventListener("click", e => {
    e.preventDefault();
    toggleElements(loginForm);
  });

  const signinEmail = document.querySelector("#signinEmail");
  const signinPassword = document.querySelector("#signinPassword");
  const signinButton = document.querySelector("#signinButton");
  signinButton.addEventListener("click", signinUser);

  const signupName = document.querySelector("#signupName");
  const signupPassword = document.querySelector("#signupPassword");
  const signupEmail = document.querySelector("#signupEmail");
  const signupBtn = document.querySelector("#signupBtn");
  signupBtn.addEventListener("click", signupUser);
  signoutAdminBtn.addEventListener("click", e => {
    signout(e, "admin");
  });
  signOutButton.addEventListener("click", signout);

  oneTimeDonationForm.addEventListener("submit", onetimeDonation);
  subscribeForm.addEventListener("submit", subscribe);

  followFilter.addEventListener("click", toggleFollowing);
  function toggleFollowing() {
    onlyFollow = onlyFollow ? false : true;
    const allAnimalS = document.querySelectorAll(".eachAnimal");
    const notFollowingS = document.querySelectorAll(
      ".eachAnimal:not(.following)"
    );
    if (onlyFollow) {
      showArrayElements(allAnimalS, "inline-block");
      hideArrayElements(notFollowingS);
      onlyCat = false;
      onlyDog = false;
      followFilter.classList.add("active");
      onlyCatFilter.classList.remove("active");
      onlyDogFilter.classList.remove("active");
    } else {
      showArrayElements(notFollowingS, "inline-block");
      followFilter.classList.remove("active");
    }
  }

  onlyCatFilter.addEventListener("click", () => {
    filterAnimalList("cat");
  });
  onlyDogFilter.addEventListener("click", () => {
    filterAnimalList("dog");
  });
}

function startUserSession(email) {
  console.log("start session");
  user.userEmail = email;
  db.collection("member")
    .where("email", "==", email)
    .get()
    .then(res => {
      res.docs.forEach(entry => {
        if (entry.data().notifyErrand) {
          user.subscribe.push("errands");
        }
        if (entry.data().notifyNewcoming) {
          user.subscribe.push("newComing");
        }
        Object.keys(user).forEach((key, i) => {
          window.sessionStorage.setItem(key, Object.values(user)[i]);
        });
      });
      //      getUserNewsfeed(user.subscribe);
    });
  newsFeedContent.innerHTML = "";
  resetForm(userSettingForm);
  clearContent(donationStatus);
  getUserSetting(email);
  getUserDonationSofar(email);
  getUserAnimals(email);
}

/*------------------------------------------
functions related to Firebase authentication
-------------------------------------------*/

function signinUser(e) {
  e.preventDefault();
  firebase
    .auth()
    .signInWithEmailAndPassword(signinEmail.value, signinPassword.value)
    .then(() => {
      toggleElements(loginForm);
      //      clearElements(feedbackMsgS);
      startUserSession(signinEmail.value);
      scrollToTop();
    })
    .catch(function(error) {
      if (String(error).indexOf("password") > -1) {
        showFeedback(loginForm, "Wrong password, try again~", "red");
      } else if (String(error).indexOf("user record") > -1) {
        showFeedback(loginForm, "Seems like you haven't signed up yet", "red");
      } else {
        showFeedback(loginForm, "Something went wrong, please try later again");
      }
    });
}

function signupUser(e) {
  e.preventDefault();
  resetForm(userSettingForm);
  //go to preferences page
  firebase
    .auth()
    .createUserWithEmailAndPassword(signupEmail.value, signupPassword.value)
    .then(() => {
      toggleElements(prefModal);
      preferenceSetting(signupEmail.value);
      scrollToTop();
    })
    .catch(function(error) {
      if (String(error).indexOf("already") > -1) {
        showFeedback(
          signupForm,
          "Looks like the owner of this email has already joined us.",
          "white"
        );
      } else {
        console.log(error);
      }
    });
}

function signout(e, arr) {
  console.log(arr);
  firebase
    .auth()
    .signOut()
    .then(function() {
      console.log("Succesfull logout");
      Object.keys(window.sessionStorage).forEach(key => {
        window.sessionStorage.removeItem(key);
      });
      currentSub = alwaysSub;
      user.subscribe = currentSub;
      if (!arr) {
        toggleElements(userSettings);
      }
      //clearElements(feedbackMsgS);
      scrollToTop();
      hideArrayElements(adminContentS);
    })
    .catch(function(error) {
      // An error happened.
      console.log(err);
    });
}

function preferenceSetting(email) {
  // sync donation value text when user adjust range bar
  syncNrWithRange(preferenceForm, preferenceForm.querySelector(".donationNr"));
  // submit form in 2 ways
  const submitPrefBtn = document.querySelector("#submitPrefBtn");
  const skipPrefBtn = document.querySelector("#skipPrefBtn");

  preferenceForm.addEventListener("submit", e => {
    sendPreferenceToDatabase(e, email);
  });
  skipPrefBtn.addEventListener("click", e => {
    if (preferenceForm.nickname.value) {
      sendPreferenceToDatabase(e, email);
    } else {
      showFeedback(
        document.querySelector("#modalTop"),
        "At least let us know your nickname~",
        "white"
      );
      document.querySelector("#nickName").focus();
    }
  });
}
/*-----------------------------------------------------------
functions that write(POST,UPDATE,DELETE) to Firebase database
------------------------------------------------------------*/

function sendPreferenceToDatabase(e, email) {
  e.preventDefault();
  // get values from preference form
  const nickname = preferenceForm.nickname.value;
  const catBol = preferenceForm.cat.checked ? true : false;
  const dogBol = preferenceForm.dog.checked ? true : false;
  const maleBol = preferenceForm.male.checked ? true : false;
  const femaleBol = preferenceForm.female.checked ? true : false;
  const smallBol = preferenceForm.small.checked ? true : false;
  const mediumBol = preferenceForm.medium.checked ? true : false;
  const largeBol = preferenceForm.large.checked ? true : false;
  const pupBol = preferenceForm.pup.checked ? true : false;
  const pregnantBol = preferenceForm.pregnant.checked ? true : false;
  const errandBol = preferenceForm.errand.checked ? true : false;
  const newcomingBol = preferenceForm.newComming.checked ? true : false;
  const monthlyDonation = preferenceForm.monthlyDonation.value;

  // add user to db with the values
  db.collection("member")
    .add({
      email: email,
      nickname: nickname,
      permission: "none",
      seeCat: catBol,
      seeDog: dogBol,
      seeMale: maleBol,
      seeFemale: femaleBol,
      seeSmall: smallBol,
      seeMedium: mediumBol,
      seeLarge: largeBol,
      seePup: pupBol,
      seePregnant: pregnantBol,
      notifyErrand: errandBol,
      notifyNewcoming: newcomingBol,
      monthlyDonation: monthlyDonation,
      following: []
    })
    .then(() => {
      pickContent();
      startUserSession(email);
      // window.sessionStorage.setItem("userEmail", email);
      // resetForm(userSettingForm);
      // clearContent(donationStatus);
      // getUserSetting(email);
      // getUserDonationSofar(email);
      // getUserNotifications(email);
      // getUserAnimals(email);
    });
  // hide modal without waiting for db success
  toggleElements(prefModal);
  //  hideElement(prefModal);
}

// function updatePreferenceToDatabase() {
//   console.log("update user preferences");
// }

function memberDonate(donationSubmitForm) {
  const animalID = donationSubmitForm.dataset.id;
  const moneyAmount = donationSubmitForm.moneyAmount.value;
  const date = donationSubmitForm.date.value;
  const userEmail = window.sessionStorage.getItem("userEmail");

  if (date) {
    const year = date.split("-")[0];
    const month = date.split("-")[1];
    const day = date.split("-")[2];
    const morning = donationSubmitForm.morning.checked;
    const afternoon = donationSubmitForm.afternoon.checked;
    const evening = donationSubmitForm.evening.checked;
    const training = donationSubmitForm.traning.checked;
    if (
      morning === true ||
      afternoon === true ||
      evening === true ||
      training === true
    ) {
      db.collection("dailyTasks")
        .add({
          animalID: animalID,
          morning: morning,
          afternoon: afternoon,
          evening: evening,
          training: training,
          year: year,
          month: month,
          day: day,
          user: userEmail
        })
        .then(console.log("Thank you~"));
    }
    let workingTimes = 0;
    if (morning === true) {
      workingTimes += 1;
    }
    if (afternoon === true) {
      workingTimes += 1;
    }
    if (evening === true) {
      workingTimes += 1;
    }
    if (training === true) {
      workingTimes += 2;
    }
    db.collection("timeDonation")
      .where("userEmail", "==", userEmail)
      .get()
      .then(res => {
        if (res.docs.length < 1) {
          db.collection("timeDonation")
            .add({
              animalID: animalID,
              userEmail: userEmail,
              time: workingTimes
            })
            .then(() => {
              const wrapper = document.querySelector(".timeSlots");
              showFeedback(wrapper, "Thank you ~", "#c18e63");
              console.log("time registered");
            });
        } else {
          db.collection("timeDonation")
            .doc(res.docs[0].id)
            .get()
            .then(user => {
              let sumSofar = user.data().time;
              sumSofar += workingTimes;
              db.collection("timeDonation")
                .doc(res.docs[0].id)
                .update({
                  time: sumSofar
                })
                .then(() => {
                  const wrapper = document.querySelector(".timeSlots");
                  showFeedback(wrapper, "Thank you ~", "#c18e63");
                  console.log("time counted up");
                });
            });
        }
      });
  }
  if (moneyAmount) {
    // check if the user has given donation before, if no, add user and donation data, if yes add the amount to the previous sum amount
    db.collection("moneyDonation")
      .where("userEmail", "==", userEmail)
      .get()
      .then(res => {
        if (res.docs.length === 0) {
          db.collection("moneyDonation")
            .add({
              amount: moneyAmount,
              userEmail: userEmail,
              animalID: animalID
            })
            .then(() => {
              const wrapper = document.querySelector(".timeSlots");
              showFeedback(wrapper, "Thank you ~", "#c18e63");
            });
        } else {
          const wrapper = document.querySelector(".timeSlots");
          showFeedback(wrapper, "Thank you ~", "#c18e63");
          console.log("already donated before, will update sum");
          res.forEach(doc => {
            let sum = Number(doc.data().amount);
            sum += Number(moneyAmount);
            db.collection("moneyDonation")
              .doc(doc.id)
              .update({
                amount: sum
              });
          });
        }
      });
  }
}

function cancelMembership() {
  var currentUser = firebase.auth().currentUser;
  currentUser
    .delete()
    .then(function() {
      console.log("Thanks for being with us~ Hope we can see you again.");
      signout();
      db.collection("member")
        .where("email", "==", user.userEmail)
        .get()
        .then(res =>
          res.forEach(doc => {
            doc.ref.delete();
          })
        );
    })
    .catch(function(error) {
      console.log(error);
    });
}

function sendMessage(e) {
  e.preventDefault();
  const user = window.sessionStorage.getItem("userEmail");
  const message = messageForm.message.value;
  if (message) {
    db.collection("toDoList")
      .add({
        task: message,
        type: "user",
        writer: user
      })
      .then(() => {
        resetForm(messageForm);
        showFeedback(messageForm.parentElement, "Got it~", "#c18e63");
        console.log("message sent");
      });
  }
}

function onetimeDonation(e) {
  e.preventDefault();
  const stuff = oneTimeDonationForm.donateWhat.value;
  const postNr = oneTimeDonationForm.postNr.value;
  const pickup = oneTimeDonationForm.pickup.checked;
  const onetimeMoney = oneTimeDonationForm.onetimeMoney.value;
  const inWhoseName = oneTimeDonationForm.inWhoseName.value;
  // if user choose pick up, then this entry shows up in errands
  if (stuff !== "" && pickup === true && !postNr) {
    showFeedback(
      donationForm,
      "Don't forget to tell us from which ZIP should we pick it up",
      "white"
    );
  } else if (stuff !== "" && pickup === true && postNr !== "") {
    db.collection("stuffDonation")
      .add({
        stuff: stuff,
        postNr: postNr
      })
      .then(() => {
        resetForm(donationForm);
        showFeedback(
          donationForm,
          "Thank you for your donation, we will contact you to arrange pickup.",
          "white"
        );
        const errandsDesc = `Pick up a ${stuff} from ${postNr}`;
        db.collection("notifications").add({
          text: errandsDesc,
          type: "errands",
          seenBy: []
        });
      });
  } else if (stuff !== "" && pickup === false) {
    db.collection("stuffDonation")
      .add({
        stuff: stuff
      })
      .then(() => {
        resetForm(donationForm);
        showFeedback(
          donationForm,
          "Thank you for your donation, looking forward to seeing you~",
          "white"
        );
      });
  }
  if (onetimeMoney !== "" && inWhoseName !== "") {
    db.collection("moneyDonation")
      .add({
        amount: onetimeMoney,
        inTheNameOf: inWhoseName
      })
      .then(() => {
        resetForm(donationForm);
        showFeedback(
          donationForm,
          `Thank you and ${inWhoseName} for your donation, hope you can join us some day ~`,
          "white"
        );
      });
  } else if (onetimeDonation !== "") {
    db.collection("moneyDonation")
      .add({
        amount: onetimeMoney
      })
      .then(() => {
        resetForm(donationForm);
        showFeedback(
          donationForm,
          `Thank you for your donation, hope you can join us some day ~`,
          "white"
        );
      });
  }
}

function subscribe(e) {
  e.preventDefault();
  const email = subscribeForm.subEmail.value;
  db.collection("subscriptionEmails")
    .add({
      email: email
    })
    .then(console.log("successfully subscribed"));
}

function stuffDonate(e) {
  e.preventDefault();
  const userEmail = window.sessionStorage.getItem("userEmail");
  const stuff = stuffDonationForm.donateWhatLoggedIn.value;
  const pickup = stuffDonationForm.pickupLoggedIn.checked ? true : false;
  db.collection("stuffDonation")
    .add({
      userEmail: userEmail,
      stuff: stuff,
      pickup: pickup
    })
    .then(() => {
      resetForm(stuffDonationForm);
      showFeedback(stuffDonationForm.parentElement, "Thank you ~", "#c18e63");
    });
  if (pickup === true) {
    const errandsDesc = `Pick up a ${stuff} from ${userEmail}`;
    db.collection("notifications")
      .add({
        text: errandsDesc,
        type: "errands",
        seenBy: []
      })
      .then(() => {
        resetForm(stuffDonationForm);
        showFeedback(
          stuffDonationForm.parentElement,
          "Thank you ~ Your donation will be picked up by one of our members",
          "#c18e63"
        );
      });
  }
}

/*-------------------------------------------------------
functions that UPDATE data from database and display them
--------------------------------------------------------*/
function markRead(e) {
  const notificationID = e.target.dataset.id;
  updateNotificationSeenBy(notificationID, user.userEmail);
  e.target.remove();
}
function markAllRead() {
  const currentNotifications = newsFeedContent.querySelectorAll("p");
  currentNotifications.forEach(n => {
    const notificationID = n.dataset.id;
    updateNotificationSeenBy(notificationID, user.userEmail);
  });
  newsFeedContent.innerHTML = "";
}
function updateNotificationSeenBy(id, user) {
  db.collection("notifications")
    .doc(id)
    .update({
      seenBy: firebase.firestore.FieldValue.arrayUnion(user)
    });
}

/*-------------------------------------------------------
functions that GET data from database and display them
--------------------------------------------------------*/
function getUserDonationSofar(userEmail) {
  db.collection("timeDonation")
    .where("userEmail", "==", userEmail)
    .get()
    .then(res => {
      res.forEach(doc => {
        const timeSoFar = doc.data().time;
        if (timeSoFar === "1") {
          document.querySelector(".timeSofar").textContent =
            timeSoFar + " hour";
        } else {
          document.querySelector(".timeSofar").textContent =
            timeSoFar + " hours";
        }
      });
    });
  db.collection("moneyDonation")
    .where("userEmail", "==", userEmail)
    .get()
    .then(res => {
      res.forEach(doc => {
        const moneySoFar = doc.data().amount;
        document.querySelector(".moneySofar").textContent = moneySoFar + " kr.";
      });
    });
  db.collection("stuffDonation")
    .where("userEmail", "==", userEmail)
    .get()
    .then(res => {
      let piece = 0;
      res.forEach(doc => {
        piece += 1;
      });
      if (piece === 1) {
        document.querySelector(".stuffSofar").textContent = piece + " piece";
      } else {
        document.querySelector(".stuffSofar").textContent = piece + " pieces";
      }
    });
}

function getUserSetting(userEmail) {
  resetForm(preferenceForm);
  // get current setting
  db.collection("member")
    .where("email", "==", userEmail)
    .get()
    .then(res => {
      res.forEach(entry => {
        const data = entry.data();
        userSettingPanel.querySelector(".userName").textContent = data.nickname;
        const updatePrefForm = document.querySelector("#userSettings form");
        // not DRY from this point on, probably no time to change it before hand in
        if (data.seeCat) {
          updatePrefForm.cat.checked = true;
        }
        if (data.seeDog) {
          updatePrefForm.dog.checked = true;
        }
        if (data.seeFemale) {
          updatePrefForm.female.checked = true;
        }
        if (data.seeMale) {
          updatePrefForm.male.checked = true;
        }
        if (data.seeSmall) {
          updatePrefForm.small.checked = true;
        }
        if (data.seeMedium) {
          updatePrefForm.medium.checked = true;
        }
        if (data.seeLarge) {
          updatePrefForm.large.checked = true;
        }
        if (data.seePup) {
          updatePrefForm.pup.checked = true;
        }
        if (data.seePregnang) {
          updatePrefForm.pregnant.checked = true;
        }
        if (data.notifyErrand) {
          updatePrefForm.errand.checked = true;
        }
        if (data.notifyNewcoming) {
          updatePrefForm.newComming.checked = true;
        }
        updatePrefForm.monthlyDonation.value = data.monthlyDonation;
        updatePrefForm.querySelector(".donationNr").textContent =
          data.monthlyDonation;
        document.querySelector(".userName").textContent = data.nickname;
      });
    });
}

function getUserNewsfeed(subscribe) {
  newsFeedContent.innerHTML = "";
  if (typeof subscribe === "string") {
    subscribe = subscribe.split(",");
  }
  subscribe.forEach(sub => {
    db.collection("notifications")
      .where("type", "==", sub)
      .get()
      .then(res => {
        res.forEach(entry => {
          if (
            !entry
              .data()
              .seenBy.includes(window.sessionStorage.getItem("userEmail"))
          ) {
            let p = document.createElement("p");
            p.classList.add(`${sub}Notification`);
            p.textContent = entry.data().text;
            p.dataset.id = entry.id;
            p.addEventListener("click", markRead);
            newsFeedContent.appendChild(p);
          }
          newsStatus = false;
        });
      });
  });
}

function getUserAnimals(userEmail) {
  // check user preferences regarding notifications
  db.collection("member")
    .where("email", "==", userEmail)
    .get()
    .then(res => {
      res.forEach(entry => {
        if (entry.data().seeCat && entry.data().seeDog === false) {
          getCats(userEmail);
        } else if (entry.data().seeDog && entry.data().seeCat === false) {
          getDogs(userEmail);
        } else {
          getAllAnimals(userEmail);
          // only show filter cat/dog if user set to see both
          onlyCatFilter.classList.remove("hiddenContent");
          onlyDogFilter.classList.remove("hiddenContent");
        }
      });
    });
}
function getCats(userEmail) {
  db.collection("animals")
    .where("type", "==", "cat")
    .get()
    .then(res => {
      appendEachAnimal(res, userEmail);
    });
}
function getDogs(userEmail) {
  db.collection("animals")
    .where("type", "==", "dog")
    .get()
    .then(res => {
      appendEachAnimal(res, userEmail);
    });
}
function getAllAnimals(userEmail) {
  db.collection("animals")
    .get()
    .then(res => {
      appendEachAnimal(res, userEmail);
    });
}

function getClickedAnimal(animalId) {
  db.collection("animals")
    .doc(animalId)
    .get()
    .then(res => {
      petExpand.style.display = "grid";
      showClickedAnimalModal(res.data(), animalId);
    });
}

// show animal modal including getting relevant info from db
function showClickedAnimalModal(data, animalID) {
  document.querySelectorAll(".eachAnimal .triangleUp").forEach(t => {
    t.style.display = "none";
  });
  document.querySelector(
    `.eachAnimal[data-id="${animalID}"] .triangleUp`
  ).style.display = "inherit";
  const src = document
    .querySelector(`.eachAnimal[data-id="${animalID}"] img`)
    .getAttribute("src");
  petExpand.innerHTML = "";
  const clone = detailedAnimalTemp.cloneNode(true);
  clone.querySelector(".bigAnimalImage img").setAttribute("src", src);
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
  // append the donation section of this animal
  let donationClone = donationTemp.cloneNode(true);
  donationClone.querySelector("form").setAttribute("data-id", animalID);
  const donationForm = donationClone.querySelector("form");
  // set min date for datepicker to yesterday (in JS getDate()+1 is today)
  const today = new Date();
  const year = today.getFullYear().toString();
  const month =
    today.getMonth() + 1 > 9
      ? (today.getMonth() + 1).toString()
      : "0" + (today.getMonth() + 1).toString();
  const day =
    today.getDate() > 9
      ? today.getDate().toString()
      : "0" + today.getDate().toString();
  donationClone
    .querySelector('input[type="date"')
    .setAttribute("min", `${year}-${month}-${day}`);

  const morning = donationClone.querySelector("label.morning");
  const afternoon = donationClone.querySelector("label.afternoon");
  const evening = donationClone.querySelector("label.evening");
  const training = donationClone.querySelector("label.training");
  // need to read db to get needed time slots
  db.collection("dailyTaskTemplate")
    .where("animalID", "==", animalID)
    .get()
    .then(res => {
      res.forEach(entry => {
        if (entry.data().morning === false) {
          morning.classList.add("crossout");
          morning.querySelector("input").setAttribute("disabled", "disabled");
        }
        if (entry.data().afternoon === false) {
          afternoon.classList.add("crossout");
          afternoon.querySelector("input").setAttribute("disabled", "disabled");
        }
        if (entry.data().evening === false) {
          evening.classList.add("crossout");
          evening.querySelector("input").setAttribute("disabled", "disabled");
        }
        if (entry.data().training === false) {
          training.classList.add("crossout");
          training.querySelector("input").setAttribute("disabled", "disabled");
        }
      });
    });
  donationForm.addEventListener("submit", validateMemberDonate);
  function validateMemberDonate(e) {
    e.preventDefault();
    const donationSubmitForm = document.querySelector("#donationFormLogginIn");
    const date = donationSubmitForm.date.value;
    const morning = donationSubmitForm.morning.checked;
    const afternoon = donationSubmitForm.afternoon.checked;
    const evening = donationSubmitForm.evening.checked;
    const training = donationSubmitForm.traning.checked;
    if (
      (morning === true ||
        afternoon === true ||
        evening === true ||
        training === true) &&
      !date
    ) {
      const wrapper = document.querySelector(".timeSlots");
      showFeedback(wrapper, "Remember to pick a date", "#c18e63");
    } else if (
      morning !== true &&
      afternoon !== true &&
      evening !== true &&
      training !== true &&
      date
    ) {
      const wrapper = document.querySelector(".timeSlots");
      showFeedback(
        donationSubmitForm.querySelector(".timeSlots"),
        "Remember to pick a time slot",
        "#c18e63"
      );
    } else {
      memberDonate(donationSubmitForm);
    }
  }
  petExpand.appendChild(clone);
  petExpand.appendChild(donationClone);
  const closeExpandBtn = document.querySelector(".closeExpandBtn");

  const triangleUpS = document.querySelectorAll(".triangleUp");

  closeExpandBtn.addEventListener("click", () => {
    petExpand.style.display = "none";
    hideArrayElements(triangleUpS);
  });
}

/*----------------------------------
general display functions, reusable
-----------------------------------*/

function scrollToTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  });
}

function hideArrayElements(array) {
  array.forEach(removeElement => {
    removeElement.style.display = "none";
  });
}

function showArrayElements(array, display) {
  array.forEach(removeElement => {
    if (display) {
      removeElement.style.display = display;
    } else {
      removeElement.style.display = "block";
    }
  });
}

function showElement(ele) {
  ele.classList.add("shownContent");
}

function hideElement(ele) {
  ele.classList.remove("shownContent");
}

function toggleElements(showEle, hideEle) {
  if (hideEle && hideEle.classList.contains("shownContent")) {
    hideEle.classList.remove("shownContent");
  }
  showEle.classList.toggle("shownContent");
}

function resetForm(form) {
  const allFormELements = form.querySelectorAll("*");
  allFormELements.forEach(e => {
    e.value = "";
    if (e.checked) {
      e.checked = false;
    }
  });
}

function clearContent(ele) {
  const contentS = ele.querySelectorAll("span");
  contentS.forEach(c => {
    c.textContent = "";
  });
}

function syncNrWithRange(form, element) {
  const donationNr = form.querySelector(".donationNr");
  element.textContent = preferenceForm.monthlyDonation.value;
  form.querySelector('input[type="range"').addEventListener("change", e => {
    element.textContent = e.target.value;
  });
}

function showFeedback(form, error, color) {
  let feedback = document.createElement("div");
  feedback.classList.add("feedbackMsg");
  feedback.textContent = error;
  feedback.style.color = color;
  form.appendChild(feedback);
  setTimeout(() => {
    document.querySelector(".feedbackMsg").remove();
  }, 1500);
}

function filterAnimalList(type) {
  const allAnimal = document.querySelectorAll(`.eachAnimal`);
  const notMatchingS = document.querySelectorAll(`.eachAnimal:not(.${type})`);
  if (type === "cat") {
    onlyCat = onlyCat ? false : true;
    if (onlyCat) {
      showArrayElements(allAnimal, "inline-block");
      hideArrayElements(notMatchingS);
      onlyCatFilter.classList.add("active");
      onlyDogFilter.classList.remove("active");
      followFilter.classList.remove("active");
      onlyDog = false;
      onlyFollow = false;
    } else {
      onlyCatFilter.classList.remove("active");
      showArrayElements(notMatchingS, "inline-block");
    }
  }
  if (type === "dog") {
    onlyDog = onlyDog ? false : true;
    if (onlyDog) {
      showArrayElements(allAnimal, "inline-block");
      hideArrayElements(notMatchingS);
      onlyDogFilter.classList.add("active");
      onlyCatFilter.classList.remove("active");
      onlyCat = false;
      onlyFollow = false;
    } else {
      onlyDogFilter.classList.remove("active");
      showArrayElements(notMatchingS, "inline-block");
    }
  }
}

function appendEachAnimal(array, userEmail) {
  animalListOnLoggedIn.innerHTML = "";
  array.forEach(entry => {
    const data = entry.data();
    let animalDiv = document.createElement("div");
    animalDiv.classList.add("eachAnimal");
    animalDiv.classList.add(data.type);
    animalDiv.dataset.id = entry.id;
    let animalName = document.createElement("p");
    animalName.textContent = data.name;
    let animalArrow = document.createElement("div");
    animalArrow.classList.add("triangleUp");
    let animalImg = document.createElement("img");
    if (entry.data().file) {
      animalImg.setAttribute("src", entry.data().file);
    } else {
      animalImg.setAttribute("src", "img/animals/newcomer.png");
    }
    // due to Firebase storage quota limit, we decided to not to use images stored in Firebase
    ////////////////////////////////////////////////////////////
    // if (data.file !== undefined && data.file !== "") {
    //   let fileName = data.file;
    //   let animalImgRef = storageReference.child(`admin/${fileName}`);
    //   animalImgRef
    //     .getDownloadURL()
    //     .then(function(url) {
    //       console.log(url);
    //       animalImg.setAttribute("src", url);
    //     })
    //     .catch(function(error) {
    //       console.log("DB error: " + error);
    //       animalImg.setAttribute("src", "img/animals/default.png");
    //     });
    // } else {
    //   animalImg.setAttribute("src", "img/animals/newcomer.png");
    // }
    ////////////////////////////////////////////////////////////
    let heart = document.createElement("img");
    heart.classList.add("heart");
    // check if user follows this animal
    db.collection("member")
      .where("email", "==", userEmail)
      .get()
      .then(res => {
        res.forEach(user => {
          if (user.data().following.indexOf(entry.id) > -1) {
            heart.setAttribute("src", "img/icons/filledheart.png");
            heart.setAttribute("alt", "filled heart icon");
            animalDiv.classList.add("following");
          } else {
            heart.setAttribute("src", "img/icons/emptyheart.png");
            heart.setAttribute("alt", "empty heart icon");
          }
        });
        heart.addEventListener("click", toggleFollow);
        function toggleFollow() {
          const heartType = heart.getAttribute("src");
          const animalID = entry.id;
          if (heartType.indexOf("filled") > -1) {
            heart.setAttribute("src", "img/icons/emptyheart.png");
            unfollowAnimal(entry.id, user.userEmail);
          } else {
            heart.setAttribute("src", "img/icons/filledheart.png");
            followAnimal(entry.id, user.userEmail);
          }
        }
        function unfollowAnimal(animal, user) {
          document
            .querySelector(`.eachAnimal[data-id=${animal}]`)
            .classList.remove("following");

          db.collection("member")
            .where("email", "==", user)
            .get()
            .then(res => {
              res.forEach(user => {
                db.collection("member")
                  .doc(user.id)
                  .update({
                    following: firebase.firestore.FieldValue.arrayRemove(animal)
                  });
              });
            });
        }
        function followAnimal(animal, user) {
          document
            .querySelector(`.eachAnimal[data-id=${animal}]`)
            .classList.add("following");
          db.collection("member")
            .where("email", "==", user)
            .get()
            .then(res => {
              res.forEach(user => {
                db.collection("member")
                  .doc(user.id)
                  .update({
                    following: firebase.firestore.FieldValue.arrayUnion(animal)
                  });
              });
            });
        }
      });
    // let statusCircle = document.createElement("div");
    // statusCircle.classList.add("statusCircle");
    animalDiv.appendChild(animalName);
    animalDiv.appendChild(animalImg);
    animalImg.addEventListener("click", e => {
      // hide side panel if present
      hideElement(userSettingPanel);
      hideElement(newsFeedPanel);
      // show animal modal with triangle pointer
      // let arrows = e.target.parentElement.querySelectorAll(".triangleUp");
      // hideArrayElements(arrows);
      // e.target.parentElement.querySelector(".triangleUp").style.display =
      //   "inherit";
      getClickedAnimal(entry.id);
    });
    animalDiv.appendChild(heart);
    //    animalDiv.appendChild(statusCircle);
    animalDiv.appendChild(animalArrow);
    animalListOnLoggedIn.appendChild(animalDiv);
  });
  moveAnimals();
}

/*-------------------------
specific display functions
-------------------------*/

// Click left/right arrow to browse through animals
function moveAnimals() {
  const leftKey = document.querySelector("#animalArrowLeft");
  const rightKey = document.querySelector("#animalArrowRight");

  leftKey.addEventListener("click", () => {
    const last = document.querySelector("#animalList").lastElementChild;
    const first = document.querySelector("#animalList").firstElementChild;

    last.remove();
    document.querySelector("#animalList").insertBefore(last, first);
  });

  rightKey.addEventListener("click", () => {
    const first = document.querySelector("#animalList").firstElementChild;

    first.remove();
    document.querySelector("#animalList").appendChild(first);
  });
}

///////////// not used yet  ////////////////
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
  let storageRef = firebase.storage().ref("member/" + file.name);

  //upload file
  let task = storageRef.put(file);

  // update progress bar
  task.on(
    "state_changed",
    function progress(snapshot) {
      let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    },
    function error(err) {},
    function complete() {
      console.log("picture is uploaded");
    }
  );
});
