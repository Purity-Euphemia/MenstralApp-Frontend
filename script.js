// script.js

// ===== Replace with your Firebase config in firebase-config.js =====
// (firebase-config.js should initialize firebase, auth, db)


// DOM elements
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const authForm = document.getElementById("auth-form");
const authError = document.getElementById("auth-error");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const toggleAuthBtn = document.getElementById("toggle-auth-btn");
const toggleAuthText = document.getElementById("toggle-auth");
const logoutBtn = document.getElementById("logoutBtn");

const cycleDayEl = document.getElementById("cycleDay");
const cycleLengthDisplay = document.getElementById("cycleLengthDisplay");
const currentPhaseEl = document.getElementById("currentPhase");
const dailyTipEl = document.getElementById("dailyTip");
const logPeriodBtn = document.getElementById("logPeriodBtn");

const startDateInput = document.getElementById("startDate");
const cycleLengthInput = document.getElementById("cycleLength");
const periodLengthInput = document.getElementById("periodLength");
const settingsForm = document.getElementById("settings-form");

const symptomCheckboxes = document.querySelectorAll(".symptom");
const logSymptomsBtn = document.getElementById("logSymptoms");

const calendarEl = document.getElementById("calendar");
const insightsEl = document.getElementById("insights");

// State
let isLoginMode = true;
let currentUser = null;
let userData = {
  startDate: null,
  cycleLength: 28,
  periodLength: 5,
  symptomsLog: {}
};

// Utility functions
function formatDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(d1, d2) {
  return Math.floor((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
}

// Toggle between login/signup
function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  authSubmitBtn.textContent = isLoginMode ? "Login" : "Register";
  toggleAuthText.innerHTML = isLoginMode
    ? `Don't have an account? <button id="toggle-auth-btn" class="link-button">Sign up</button>`
    : `Already have an account? <button id="toggle-auth-btn" class="link-button">Login</button>`;

  // Re-bind the toggleAuthBtn because innerHTML replaced the button
  document.getElementById("toggle-auth-btn").addEventListener("click", toggleAuthMode);
  authError.textContent = "";
}

toggleAuthBtn.addEventListener("click", toggleAuthMode);

// Auth form submit (login or register)
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    if (isLoginMode) {
      await auth.signInWithEmailAndPassword(email, password);
    } else {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      // initialize new user in Firestore
      await db.collection("users").doc(cred.user.uid).set({
        startDate: null,
        cycleLength: 28,
        periodLength: 5,
        symptomsLog: {}
      });
    }
  } catch (err) {
    authError.textContent = err.message;
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut();
});

// Auth state listener
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    authContainer.style.display = "none";
    appContainer.style.display = "block";

    const docRef = db.collection("users").doc(user.uid);
    const doc = await docRef.get();
    if (doc.exists) {
      userData = doc.data();
    } else {
      // Initialize if new user
      await docRef.set(userData);
    }

    updateUI();
  } else {
    // Not logged in
    currentUser = null;
    appContainer.style.display = "none";
    authContainer.style.display = "block";
  }
});

// Calculate cycle day
function getCycleDay() {
  if (!userData.startDate) return "-";
  const days = diffDays(userData.startDate, new Date());
  return (days % userData.cycleLength) + 1;
}

// Determine phase
function getPhase(day) {
  if (!userData.startDate) return "-";
  if (day <= userData.periodLength) return "Period";
  if (day === userData.cycleLength - 14) return "Ovulation";
  if (day >= userData.cycleLength - 13 && day <= userData.cycleLength - 9) return "Fertile";
  return "Safe";
}

// Tip per phase
function getTip(phase) {
  const tips = {
    Period: "Stay hydrated and rest if needed.",
    Ovulation: "Peak fertility day – take note!",
    Fertile: "You may feel more energetic and social.",
    Safe: "Relax and enjoy your day!"
  };
  return tips[phase] || "";
}

// Next period prediction
function getNextPeriod() {
  if (!userData.startDate) return null;
  let date = new Date(userData.startDate);
  while (date <= new Date()) {
    date = addDays(date, userData.cycleLength);
  }
  return date;
}

// Update UI with userData
function updateUI() {
  const cd = getCycleDay();
  const phase = getPhase(cd);

  cycleDayEl.textContent = cd;
  cycleLengthDisplay.textContent = userData.cycleLength;

  currentPhaseEl.textContent = phase;
  // Set class for currentPhaseEl so it styles accordingly
  currentPhaseEl.className = `current-phase ${phase.toLowerCase()}`;

  dailyTipEl.textContent = getTip(phase);

  renderCalendar();
  renderInsights();
}

// Render the calendar with period, fertile window, ovulation
function renderCalendar() {
  calendarEl.innerHTML = "";
  if (!userData.startDate) return;

  const today = new Date();
  let cycleStart = new Date(userData.startDate);
  while (addDays(cycleStart, userData.cycleLength) <= today) {
    cycleStart = addDays(cycleStart, userData.cycleLength);
  }

  for (let i = 0; i < userData.cycleLength * 2; i++) {
    const day = addDays(cycleStart, i);
    const box = document.createElement("div");
    box.classList.add("date-box");

    if (i < userData.periodLength) box.classList.add("period");
    else if (i === userData.cycleLength - 14) box.classList.add("ovulation");
    else if (i >= userData.cycleLength - 13 && i <= userData.cycleLength - 9) box.classList.add("fertile");

    if (formatDate(day) === formatDate(new Date())) {
      box.classList.add("today");
    }

    box.textContent = day.getDate();
    calendarEl.appendChild(box);
  }
}

// Render insights
function renderInsights() {
  const next = getNextPeriod();
  insightsEl.innerHTML = next
    ? `<div>Next period expected: <strong>${formatDate(next)}</strong></div>`
    : `<div>No period prediction available</div>`;
}

// Event handlers

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  userData.startDate = startDateInput.value;
  userData.cycleLength = parseInt(cycleLengthInput.value);
  userData.periodLength = parseInt(periodLengthInput.value);

  await db.collection("users").doc(currentUser.uid).update({
    startDate: userData.startDate,
    cycleLength: userData.cycleLength,
    periodLength: userData.periodLength
  });

  updateUI();
  alert("Settings saved");
});

logPeriodBtn.addEventListener("click", async () => {
  const todayStr = formatDate(new Date());
  userData.startDate = todayStr;
  startDateInput.value = todayStr;

  await db.collection("users").doc(currentUser.uid).update({ startDate: todayStr });

  updateUI();
  alert("Period start logged for today.");
});

logSymptomsBtn.addEventListener("click", async () => {
  const todayStr = formatDate(new Date());
  const selectedSymptoms = Array.from(symptomCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  userData.symptomsLog = userData.symptomsLog || {};
  userData.symptomsLog[todayStr] = selectedSymptoms;

  await db.collection("users").doc(currentUser.uid).update({ symptomsLog: userData.symptomsLog });

  alert("Symptoms logged");
  symptomCheckboxes.forEach(cb => cb.checked = false);
});
