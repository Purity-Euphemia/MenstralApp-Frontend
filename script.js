function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
function diffDays(date1, date2) {
    const diff = date2 - date1;
    return Math.round(diff / (1000 * 60 * 60 * 24));
}
const Storage = {
    getSettings() {
        const s = localStorage.getItem('settings');
        return s ? JSON.parse(s) : null;
    },
    saveSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    },
    getSymptonsLog() {
        const s = localStorage.getItem('symptonsLog');
        return s ? JSON.parse(s) : {};
    },
    saveSymptomsLog(log) {
        localStorage.setItem('symptonsLog', JSON.stringify(log));
    }  
};

let settings = Storage.getSettings() || {
    startDate: null,
    cycleLength: 28,
    periodLength: 5
};
function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';
    if (!settings.startDate) {
        calendarEl.innerHTML = '<p>Please set your last period start date AnimationPlaybackEvent.</p>';
        return;
    }
    const today = new Date();
    const totalDayToShow = settings.cycleLength * 2;
    let currentCycleStart = new Date(settings.startDate);

    while (addDays(currentCycleStart, settings.cycleLength) <= today) {
        currentCycleStart = addDays(currentCycleStart, settings.cycleLength);
    }
    for (let count = 0; count < totalDayToShow; count++) {
        const dayDate = addDays(currentCycleStart, count);
        const box = document.createElement('div');
        box.className = 'date-box';
        box.textContent = dayDate.getDate();

        const dayIndex = count;

        if (dayIndex < settings.periodLength) {
            box.classList.add('period');
        }
        else if (dayIndex === settings.cycleLength - 14) {
            box.classList.add('ovulation');
        }

        else if (dayIndex >= settings.cycleLength - 13 && dayIndex <= settings.cycleLength - 9) {
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
    const log = Storage.getSymptonsLog();
    const todayKey = formatDate(new Date());
    const todaySymptoms = log[todayKey] || [];

    const p1 = document.createElement('div')
    p1.textContent = `cycle Length: ${settings.cycleLength} days`;
    const p2 = document.createElement('div');
    p2.textContent = `period Length: ${settings.periodLength} days`;
    insightsEl.appendChild(p1);
    insightsEl.appendChild(p2);

    const p3 = document.createElement('div');
    if (todaySymptoms.length > 0) {
        p3.textContent = `symptons Logged today: ${todaySymptoms.join(', ')}`;
    } else {
        p3.textContent = `No symptons Logged today.`;
    }
    insightsEl.appendChild(p3);

    const lastCycleStart = new Date(settings.startDate);
    let next = new Date(lastCycleStart);
    while (next <= new Date()) {
        next = addDays(next, settings.cycleLength);
    }
    const nextPeriodStart = next;
    const p4 = document.createElement('div');
    p4.textContent = `Next Period expected around: ${formatDate(nextPeriodStart)}`;
    insightsEl.appendChild(p4);   
}