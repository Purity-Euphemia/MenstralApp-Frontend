const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDate = (date) => date.toISOString().split('T')[0];

const diffDays = (date1, date2) => {
  const diff = date2 - date1;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};


const Storage = {
  getSettings: () => JSON.parse(localStorage.getItem('settings')) || null,
  saveSettings: (settings) => localStorage.setItem('settings', JSON.stringify(settings)),
  getSymptomsLog: () => JSON.parse(localStorage.getItem('symptomsLog')) || {},
  saveSymptomsLog: (log) => localStorage.setItem('symptomsLog', JSON.stringify(log))
};


let settings = Storage.getSettings() || {
  startDate: null,
  cycleLength: 28,
  periodLength: 5
};

document.addEventListener('DOMContentLoaded', () => {
  if (settings.startDate) {
    document.getElementById('startDate').value = settings.startDate;
    document.getElementById('cycleLength').value = settings.cycleLength;
    document.getElementById('periodLength').value = settings.periodLength;
  }

  renderCalendar();
  renderInsights();
  updateDailyInsights();

  document.getElementById('settings-form').addEventListener('submit', handleSettingsSubmit);
  document.getElementById('logSymptoms').addEventListener('click', handleLogSymptoms);
  document.getElementById('logPeriodBtn').addEventListener('click', handleLogPeriodStart);
});

function handleSettingsSubmit(e) {
  e.preventDefault();
  const startDate = document.getElementById('startDate').value;
  const cycleLength = parseInt(document.getElementById('cycleLength').value);
  const periodLength = parseInt(document.getElementById('periodLength').value);

  settings = { startDate, cycleLength, periodLength };
  Storage.saveSettings(settings);

  renderCalendar();
  renderInsights();
  updateDailyInsights();
}

function handleLogSymptoms() {
  const checkboxes = document.querySelectorAll('.symptom:checked');
  const symptoms = Array.from(checkboxes).map(cb => cb.value);
  const log = Storage.getSymptomsLog();
  const todayKey = formatDate(new Date());

  log[todayKey] = symptoms;
  Storage.saveSymptomsLog(log);
  renderInsights();
}

function handleLogPeriodStart() {
  const today = formatDate(new Date());
  settings.startDate = today;
  document.getElementById('startDate').value = today;
  Storage.saveSettings(settings);
  renderCalendar();
  renderInsights();
  updateDailyInsights();
}


function renderCalendar() {
  const calendarEl = document.getElementById('calendar');
  calendarEl.innerHTML = '';

  if (!settings.startDate) {
    calendarEl.innerHTML = '<p>Please set your last period start date above.</p>';
    return;
  }

  const today = new Date();
  const totalDays = settings.cycleLength * 2;
  let cycleStart = new Date(settings.startDate);

  while (addDays(cycleStart, settings.cycleLength) <= today) {
    cycleStart = addDays(cycleStart, settings.cycleLength);
  }

  for (let i = 0; i < totalDays; i++) {
    const dayDate = addDays(cycleStart, i);
    const box = document.createElement('div');
    box.className = 'date-box';
    box.textContent = dayDate.getDate();

    
    if (i < settings.periodLength) {
      box.classList.add('period');
    } else if (i === settings.cycleLength - 14) {
      box.classList.add('ovulation');
    } else if (i >= settings.cycleLength - 13 && i <= settings.cycleLength - 9) {
      box.classList.add('fertile');
    }

    
    if (formatDate(dayDate) === formatDate(today)) {
      box.style.border = '2px solid #d63384';
      box.style.fontWeight = '700';
    }

    calendarEl.appendChild(box);
  }
}


function renderInsights() {
  const insightsEl = document.getElementById('insights');
  insightsEl.innerHTML = '';

  const log = Storage.getSymptomsLog();
  const todayKey = formatDate(new Date());
  const todaySymptoms = log[todayKey] || [];

  const insights = [
    `Cycle Length: ${settings.cycleLength} days`,
    `Period Length: ${settings.periodLength} days`,
    todaySymptoms.length
      ? `Symptoms today: ${todaySymptoms.join(', ')}`
      : 'No symptoms logged today.',
    `Next period expected: ${formatDate(getNextPeriodDate())}`
  ];

  insights.forEach(text => {
    const div = document.createElement('div');
    div.textContent = text;
    insightsEl.appendChild(div);
  });
}


function getCurrentCycleDay() {
  if (!settings.startDate) return -1;
  const start = new Date(settings.startDate);
  const today = new Date();
  if (today < start) return -1;

  const diff = diffDays(start, today);
  return (diff % settings.cycleLength) + 1;
}

function getNextPeriodDate() {
  if (!settings.startDate) return '-';
  let next = new Date(settings.startDate);
  while (next <= new Date()) {
    next = addDays(next, settings.cycleLength);
  }
  return next;
}

function getCurrentPhase(day) {
  if (day === -1) return '-';
  if (day <= settings.periodLength) return 'Period';
  if (day === settings.cycleLength - 14) return 'Ovulation';
  if (day >= settings.cycleLength - 13 && day <= settings.cycleLength - 9) return 'Fertile';
  return 'Safe';
}

function getDailyTip(phase) {
  const tips = {
    Period: 'Stay hydrated and rest. Gentle yoga can help with cramps.',
    Ovulation: 'You’re at peak fertility today. You might feel more confident.',
    Fertile: 'High energy days. Great time for socializing and productivity.',
    Safe: 'Low fertility window. Focus on rest, reflection, and balance.',
    '-': 'Set your cycle start date to receive daily tips.'
  };
  return tips[phase] || '';
}

// =======================
// 🌤️ Daily Insights Block
// =======================
function updateDailyInsights() {
  const day = getCurrentCycleDay();
  const phase = getCurrentPhase(day);

  document.getElementById('cycleDay').textContent = day !== -1 ? day : '-';
  document.getElementById('cycleLengthDisplay').textContent = settings.cycleLength;
  document.getElementById('currentPhase').textContent = phase;

  const phaseEl = document.getElementById('currentPhase');
  phaseEl.className = 'current-phase';

  if (phase === 'Period') phaseEl.classList.add('period');
  else if (phase === 'Ovulation') phaseEl.classList.add('ovulation');
  else if (phase === 'Fertile') phaseEl.classList.add('fertile');
  else if (phase === 'Safe') phaseEl.classList.add('safe');

  document.getElementById('dailyTip').textContent = getDailyTip(phase);
}
