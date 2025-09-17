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
}