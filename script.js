
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = null;

const authForm = document.getElementById("auth-form");
const toggleAuthBtn = document.getElementById("toggle-auth-btn");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const authError = document.getElementById("auth-error");
const authContainer = document.getElementById("auth-container");
const appContainer = document.getElementById("app-container");
const logoutBtn = document.getElementById("logoutBtn");

let isLogin = true;

toggleAuthBtn.addEventListener("click", () => {
  isLogin = !isLogin;
  authSubmitBtn.textContent = isLogin ? "Login" : "Register";
  toggleAuthBtn.textContent = isLogin ? "Sign up" : "Login";
});

authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (isLogin) {
    if (users[email] && users[email].password === password) {
      currentUser = email;
      showApp();
    } else {
      authError.textContent = "Invalid credentials.";
    }
  } else {
    if (users[email]) {
      authError.textContent = "User already exists.";
    } else {
      users[email] = {
        password,
        data: {
          startDate: null,
          cycleLength: 28,
          periodLength: 5,
          symptoms: [],
        },
      };
      localStorage.setItem("users", JSON.stringify(users));
      authError.textContent = "Registration successful! Please log in.";
      isLogin = true;
      authSubmitBtn.textContent = "Login";
      toggleAuthBtn.textContent = "Sign up";
    }
  }
});

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  authContainer.style.display = "block";
  appContainer.style.display = "none";
});


function showApp() {
  authContainer.style.display = "none";
  appContainer.style.display = "block";
  loadData();
}


document.getElementById("settings-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const startDate = document.getElementById("startDate").value;
  const cycleLength = +document.getElementById("cycleLength").value;
  const periodLength = +document.getElementById("periodLength").value;

  users[currentUser].data.startDate = startDate;
  users[currentUser].data.cycleLength = cycleLength;
  users[currentUser].data.periodLength = periodLength;
  localStorage.setItem("users", JSON.stringify(users));
  loadData();
});


document.getElementById("logSymptoms").addEventListener("click", () => {
  const symptoms = Array.from(document.querySelectorAll(".symptom:checked")).map(el => el.value);
  users[currentUser].data.symptoms = symptoms;
  localStorage.setItem("users", JSON.stringify(users));
  alert("Symptoms logged!");
});

document.getElementById("logPeriodBtn").addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("startDate").value = today;
  users[currentUser].data.startDate = today;
  localStorage.setItem("users", JSON.stringify(users));
  loadData();
});


function loadData() {
  const data = users[currentUser].data;
  if (!data.startDate) return;

  const startDate = new Date(data.startDate);
  const today = new Date();
  const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const cycleDay = (diffDays % data.cycleLength) + 1;

  document.getElementById("cycleDay").textContent = cycleDay;
  document.getElementById("cycleLengthDisplay").textContent = data.cycleLength;

  let phase = "Safe";
  if (cycleDay <= data.periodLength) {
    phase = "Period";
  } else if (cycleDay >= data.cycleLength - 14 && cycleDay <= data.cycleLength - 10) {
    phase = "Fertile";
  } else if (cycleDay === data.cycleLength - 14) {
    phase = "Ovulation";
  }

  const phaseEl = document.getElementById("currentPhase");
  phaseEl.textContent = phase;
  phaseEl.className = "current-phase " + phase.toLowerCase();

  document.getElementById("dailyTip").textContent =
    phase === "Period"
      ? "Rest and hydrate."
      : phase === "Fertile"
      ? "Fertile window. Track carefully."
      : phase === "Ovulation"
      ? "Ovulation today!"
      : "Normal day.";

  renderCalendar(startDate, data);
  renderInsights(data);
}

function renderCalendar(startDate, data) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const today = new Date();
  for (let i = -3; i <= 27; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayDiff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    const cycleDay = (dayDiff % data.cycleLength) + 1;

    let phase = "";
    if (cycleDay <= data.periodLength) phase = "period";
    else if (cycleDay === data.cycleLength - 14) phase = "ovulation";
    else if (cycleDay >= data.cycleLength - 14 && cycleDay <= data.cycleLength - 10) phase = "fertile";

    const dayDiv = document.createElement("div");
    dayDiv.textContent = `${date.toDateString().slice(0, 10)} - Day ${cycleDay}`;
    dayDiv.className = `calendar-day ${phase}`;
    calendar.appendChild(dayDiv);
  }
}

function renderInsights(data) {
  const insights = document.getElementById("insights");
  insights.innerHTML = "";

  const ul = document.createElement("ul");
  if (data.symptoms.length === 0) {
    ul.innerHTML = "<li>No symptoms logged yet.</li>";
  } else {
    data.symptoms.forEach(s => {
      const li = document.createElement("li");
      li.textContent = s.replace("_", " ");
      ul.appendChild(li);
    });
  }
  insights.appendChild(ul);
}
