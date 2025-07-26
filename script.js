let availableDates = [];
let firstSelectedDate = null;
let secondSelectedDate = null;

const infoForm = document.getElementById("info-form");
const calendarSection = document.getElementById("calendar-section");
const confirmationSection = document.getElementById("confirmation-section");
const calendarMonth1 = document.getElementById("calendar-month-1");
const calendarMonth2 = document.getElementById("calendar-month-2");
const selectedDatesDiv = document.getElementById("selected-dates");
const messageDiv = document.getElementById("message");
const clearBtn = document.getElementById("clear-selection");

// Create and append Submit Schedule button dynamically
const submitScheduleBtn = document.createElement("button");
submitScheduleBtn.textContent = "Submit Schedule";
submitScheduleBtn.style.marginTop = "20px";
submitScheduleBtn.style.display = "none"; // hidden initially
calendarSection.appendChild(submitScheduleBtn);

infoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  calendarSection.style.display = "block";
  infoForm.style.display = "none";
  confirmationSection.style.display = "none";

  firstSelectedDate = null;
  secondSelectedDate = null;
  selectedDatesDiv.innerHTML = "";
  messageDiv.innerHTML = "";
  submitScheduleBtn.style.display = "none";
  submitScheduleBtn.disabled = false;

  renderCalendars();
});

clearBtn.addEventListener("click", () => {
  firstSelectedDate = null;
  secondSelectedDate = null;
  selectedDatesDiv.innerHTML = "";
  messageDiv.innerHTML = "";
  submitScheduleBtn.style.display = "none";
  submitScheduleBtn.disabled = false;
  renderCalendars();
});

submitScheduleBtn.addEventListener("click", () => {
  messageDiv.textContent = "Submitting your schedule...";
  submitScheduleBtn.disabled = true;

  setTimeout(() => {
    calendarSection.style.display = "none";
    confirmationSection.style.display = "block";
  }, 5000);
});

fetch('available_dates.json')
  .then(response => response.json())
  .then(data => {
    availableDates = data.dates.map(dateStr => {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  })
  .catch(err => {
    console.error("Error loading available_dates.json", err);
  });

function renderCalendars() {
  calendarMonth1.innerHTML = "";
  calendarMonth2.innerHTML = "";
  const today = new Date();
  const month1 = new Date(today.getFullYear(), today.getMonth(), 1);
  const month2 = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  calendarMonth1.appendChild(createCalendarTable(month1));
  calendarMonth2.appendChild(createCalendarTable(month2));

  addDateClickListeners();
  updateDateStyles();
}

function createCalendarTable(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const table = document.createElement("table");
  table.classList.add("calendar-table");

  const caption = document.createElement("caption");
  caption.textContent = firstDay.toLocaleString("default", { month: "long", year: "numeric" });
  table.appendChild(caption);

  const daysRow = document.createElement("tr");
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    daysRow.appendChild(th);
  });
  table.appendChild(daysRow);

  let row = document.createElement("tr");
  // Empty cells before first day
  for (let i = 0; i < firstDay.getDay(); i++) {
    row.appendChild(document.createElement("td"));
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    if (row.children.length === 7) {
      table.appendChild(row);
      row = document.createElement("tr");
    }

    const cell = document.createElement("td");
    cell.textContent = day;

    const cellDate = new Date(year, month, day);
    cellDate.setHours(0, 0, 0, 0);

    if (isAvailable(cellDate)) {
      cell.classList.add("available");
      cell.dataset.date = cellDate.toISOString();
    } else {
      cell.classList.add("greyed");
    }

    row.appendChild(cell);
  }

  // Fill empty cells at end
  while (row.children.length < 7) {
    row.appendChild(document.createElement("td"));
  }
  table.appendChild(row);

  return table;
}

function isAvailable(date) {
  return availableDates.some(d => d.getTime() === date.getTime());
}

function addDateClickListeners() {
  document.querySelectorAll("td.available").forEach(cell => {
    cell.addEventListener("click", () => {
      const date = new Date(cell.dataset.date);
      onDateSelect(date);
    });
  });
}

function onDateSelect(date) {
  if (!firstSelectedDate) {
    firstSelectedDate = date;
    messageDiv.textContent = `First visit selected: ${formatDate(date)}. Please select the second visit date (6–8 days before or after).`;
  } else if (!secondSelectedDate) {
    if (isValidSecondDate(date)) {
      secondSelectedDate = date;
      showSelectedDatesAndTimes();
      submitScheduleBtn.style.display = "block";
    } else {
      alert("Second visit must be 6 to 8 days before or after the first visit.");
      return;
    }
  }
  updateDateStyles();
}

function isValidSecondDate(date) {
  if (!firstSelectedDate) return false;
  const diffDays = Math.abs((date - firstSelectedDate) / (1000 * 60 * 60 * 24));
  return diffDays >= 6 && diffDays <= 8;
}

function updateDateStyles() {
  document.querySelectorAll("td.available").forEach(cell => {
    const date = new Date(cell.dataset.date);
    cell.classList.remove("selected", "light-blue");

    if (firstSelectedDate && secondSelectedDate) {
      if (isSameDate(date, firstSelectedDate) || isSameDate(date, secondSelectedDate)) {
        cell.classList.add("selected");
      } else {
        cell.classList.add("greyed");
      }
    } else if (firstSelectedDate) {
      if (isSameDate(date, firstSelectedDate)) {
        cell.classList.add("selected");
      } else if (isValidSecondDate(date)) {
        cell.classList.add("light-blue");
        cell.classList.remove("greyed");
      } else {
        cell.classList.add("greyed");
      }
    } else {
      cell.classList.remove("greyed");
    }
  });
}

function showSelectedDatesAndTimes() {
  const napTime = document.getElementById("nap-time").value;
  selectedDatesDiv.innerHTML = `
    <p>Your Visit 1 date is: ${formatDate(firstSelectedDate)}</p>
    <p>Your Visit 2 date is: ${formatDate(secondSelectedDate)}</p>
  `;

  const visit1Time = calculateVisitTime(firstSelectedDate, napTime);
  const visit2Time = calculateVisitTime(secondSelectedDate, napTime);

  messageDiv.innerHTML = `
    <strong>Visit Times (2 hours 15 minutes before nap time):</strong><br>
    Visit 1: ${visit1Time}<br>
    Visit 2: ${visit2Time}
  `;
}

function calculateVisitTime(date, napTime) {
  if (!napTime) return "Nap time not set";
  const [napHour, napMinute] = napTime.split(":").map(Number);
  const visitDateTime = new Date(date);
  visitDateTime.setHours(napHour);
  visitDateTime.setMinutes(napMinute);
  visitDateTime.setSeconds(0);
  visitDateTime.setMilliseconds(0);
  visitDateTime.setMinutes(visitDateTime.getMinutes() - 135); // 2h 15m before nap

  return visitDateTime.toLocaleString();
}

function isSameDate(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}
