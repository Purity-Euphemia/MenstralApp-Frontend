document.addEventListener("DOMContentLoaded", () => {
  const authContainer = document.getElementById("auth-container");
  const appContainer = document.getElementById("app-container");

  const authForm = document.getElementById("auth-form");
  const toggleAuthBtn = document.getElementById("toggle-auth-btn");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const logoutBtn = document.getElementById("logoutBtn");

  const startDateInput = document.getElementById("startDate");
  const cycleLengthInput = document.getElementById("cycleLength");
  const periodLengthInput = document.getElementById("periodLength");
  const settingsForm = document.getElementById("settings-form");

  const calendarContainer = document.getElementById("calendar");
  const cycleDayDisplay = document.getElementById("cycleDay");
  const cycleLengthDisplay = document.getElementById("cycleLengthDisplay");
  const currentPhaseDisplay = document.getElementById("currentPhase");
  const dailyTip = document.getElementById("dailyTip");
  const logPeriodBtn = document.getElementById("logPeriodBtn");

  let userSettings = JSON.parse(localStorage.getItem("userSettings")) || {
    startDate: null,
    cycleLength: 28,
    periodLength: 5,
  };
  let isLoggedIn = JSON.parse(localStorage.getItem("isLoggedIn")) || false;

  function updateUIOnLogin() {
    if (isLoggedIn) {
      authContainer.classList.add("hidden");
      appContainer.classList.remove("hidden");

      if (userSettings.startDate) {
        startDateInput.value = userSettings.startDate;
      }
      cycleLengthInput.value = userSettings.cycleLength;
      periodLengthInput.value = userSettings.periodLength;

      loadApp();
    } else {
      authContainer.classList.remove("hidden");
      appContainer.classList.add("hidden");
    }
  }

  updateUIOnLogin();

  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    isLoggedIn = true;
    localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
    updateUIOnLogin();
  });

  toggleAuthBtn.addEventListener("click", () => {
    if (authSubmitBtn.textContent === "Login") {
      authSubmitBtn.textContent = "Register";
      toggleAuthBtn.textContent = "Already have an account? Login";
    } else {
      authSubmitBtn.textContent = "Login";
      toggleAuthBtn.textContent = "Don't have an account? Sign up";
    }
  });

  logoutBtn.addEventListener("click", () => {
    isLoggedIn = false;
    localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
    updateUIOnLogin();
  });

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();

    userSettings.startDate = startDateInput.value;
    userSettings.cycleLength = parseInt(cycleLengthInput.value);
    userSettings.periodLength = parseInt(periodLengthInput.value);

    localStorage.setItem("userSettings", JSON.stringify(userSettings));
    loadApp();
  });

  function loadApp() {
    const startDate = new Date(userSettings.startDate);
    if (isNaN(startDate)) return;

    const today = new Date();
    const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const cycleDay = (diffDays % userSettings.cycleLength) + 1;

    cycleDayDisplay.textContent = cycleDay;
    cycleLengthDisplay.textContent = userSettings.cycleLength;

    const phase = getPhase(cycleDay);
    currentPhaseDisplay.textContent = `${phase.emoji} ${phase.label}`;
    currentPhaseDisplay.className = `current-phase ${phase.name}`;
    dailyTip.textContent = phase.tip;

    renderCalendar();
  }

  function getPhase(day) {
    const ovulationDay = userSettings.cycleLength - 14;
    const fertileStart = ovulationDay - 4;
    const fertileEnd = ovulationDay + 1;

    if (day <= userSettings.periodLength) {
      return { name: "period", label: "Period (Bleeding)", emoji: "🩸", tip: "Rest and hydrate." };
    } else if (day === ovulationDay) {
      return { name: "ovulation", label: "Ovulation Day", emoji: "💧", tip: "High chance of conception." };
    } else if (day >= fertileStart && day <= fertileEnd) {
      return { name: "fertile", label: "Fertile Window", emoji: "🌱", tip: "Fertility is high. Track symptoms." };
    } else {
      return { name: "safe", label: "Safe Days", emoji: "✅", tip: "Low chance of conception." };
    }
  }

  function renderCalendar() {
    calendarContainer.innerHTML = "";

    const startDate = new Date(userSettings.startDate);
    const today = new Date();

    for (let i = 0; i < userSettings.cycleLength; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayDiff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
      const cycleDay = (dayDiff % userSettings.cycleLength) + 1;
      const phase = getPhase(cycleDay);

      const box = document.createElement("div");
      box.className = `calendar-box ${phase.name}`;
      box.innerHTML = `
        <div class="day-number">${date.getDate()}</div>
        <div class="emoji">${phase.emoji}</div>
        <div class="label">${phase.label}</div>
      `;
      if (date.toDateString() === today.toDateString()) {
        box.classList.add("today");
      }
      calendarContainer.appendChild(box);
    }
  }

  if (!userSettings.startDate) {
    startDateInput.valueAsDate = new Date();
  }

  if (logPeriodBtn) {
    logPeriodBtn.addEventListener("click", () => {
      const todayStr = new Date().toISOString().split("T")[0];
      startDateInput.value = todayStr;
      userSettings.startDate = todayStr;
      localStorage.setItem("userSettings", JSON.stringify(userSettings));
      loadApp();
      alert("Period start logged for today!");
    });
  }
});
