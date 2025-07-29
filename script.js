let parentInfo = {};
let availableDates = [];

fetch('available_dates.txt')
  .then(res => res.text())
  .then(text => {
    availableDates = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
      .map(d => {
        const dt = new Date(d);
        dt.setHours(0, 0, 0, 0);
        return dt;
      });
    setup();
  }); 

const calendarMonth1 = document.getElementById("calendar-month-1");
const calendarMonth2 = document.getElementById("calendar-month-2");
const selectedDatesDiv = document.getElementById("selected-dates");
const clearBtn = document.getElementById("clear-selection");
const submitBtn = document.getElementById("submit-schedule");
const infoForm = document.getElementById("info-form");
const calendarSection = document.getElementById("calendar-section");

let selectedDates = [];

function datesEqual(d1, d2) {
  return d1.getTime() === d2.getTime();
}

function renderCalendar(container, year, month) {
  container.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const table = document.createElement("table");
  table.className = "calendar-table";

  const caption = document.createElement("caption");
  caption.textContent = firstDay.toLocaleString("default", { month: "long", year: "numeric" });
  table.appendChild(caption);

  const headerRow = document.createElement("tr");
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  let totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  let dayNum = 1;

  for (let i = 0; i < totalCells; i++) {
    if (i % 7 === 0) var row = document.createElement("tr");

    const cell = document.createElement("td");

    if (i >= startDay && dayNum <= daysInMonth) {
      const cellDate = new Date(year, month, dayNum);
      cellDate.setHours(0, 0, 0, 0);

      const isAvail = availableDates.some(d => datesEqual(d, cellDate));
      cell.textContent = dayNum;

      if (!isAvail) {
        cell.classList.add("greyed");
      } else {
        if (selectedDates.some(d => datesEqual(d, cellDate))) {
          cell.classList.add("selected");
        } else if (selectedDates.length === 1) {
          const diff = Math.floor((cellDate - selectedDates[0]) / (1000 * 60 * 60 * 24));
          if ((diff >= 6 && diff <= 8) || (diff <= -6 && diff >= -8)) {
            cell.classList.add("light-blue");
          } else {
            cell.classList.add("greyed");
          }
        } else {
          cell.classList.add("available");
        }
        cell.addEventListener("click", () => onDateClick(cellDate));
      }
      dayNum++;
    } else {
      cell.classList.add("greyed");
    }

    row.appendChild(cell);
    if (i % 7 === 6) table.appendChild(row);
  }

  container.appendChild(table);
}

function onDateClick(date) {
  if (selectedDates.length === 0) {
    selectedDates.push(date);
  } else if (selectedDates.length === 1) {
    const diff = Math.abs((date - selectedDates[0]) / (1000 * 60 * 60 * 24));
    if (diff >= 6 && diff <= 8) {
      selectedDates.push(date);
    } else {
      alert("Second visit must be 6 to 8 days apart.");
    }
  }
  updateCalendars();
  updateSelectedDatesText();
  submitBtn.disabled = selectedDates.length !== 2;
}

function updateCalendars() {
  const today = new Date();
  renderCalendar(calendarMonth1, today.getFullYear(), today.getMonth());
  renderCalendar(calendarMonth2, today.getFullYear(), today.getMonth() + 1);
}

function updateSelectedDatesText() {
  if (selectedDates.length === 0) {
    selectedDatesDiv.innerHTML = "<p>No dates selected yet.</p>";
  } else if (selectedDates.length === 1) {
    selectedDatesDiv.innerHTML = `<p>Visit 1: <strong>${selectedDates[0].toDateString()}</strong></p>`;
  } else {
    const sorted = selectedDates.slice().sort((a, b) => a - b);
    selectedDatesDiv.innerHTML = `
      <p>Visit 1: <strong>${sorted[0].toDateString()}</strong> &nbsp;|&nbsp; Visit 2: <strong>${sorted[1].toDateString()}</strong></p>`;
  }
}

clearBtn.addEventListener("click", () => {
  selectedDates = [];
  updateCalendars();
  updateSelectedDatesText();
  submitBtn.disabled = true;
});

infoForm.addEventListener("submit", e => {
  e.preventDefault();
  parentInfo = {
    parentName: document.getElementById("parent-name").value.trim(),
    parentEmail: document.getElementById("parent-email").value.trim(),
    childName: document.getElementById("child-name").value.trim(),
    napTime: document.getElementById("nap-time").value
  };

  if (!Object.values(parentInfo).every(Boolean)) {
    alert("Please fill in all fields.");
    return;
  }

  infoForm.style.display = "none";
  calendarSection.style.display = "block";

  updateCalendars();
  updateSelectedDatesText();
});

submitBtn.addEventListener("click", () => {
  if (selectedDates.length !== 2) {
    alert("Please select two dates.");
    return;
  }

  localStorage.setItem('parentInfo', JSON.stringify(parentInfo));
  localStorage.setItem('selectedDates', JSON.stringify(selectedDates.map(d => d.toISOString())));
  window.location.href = "confirmation.html";
});

function setup() {
  infoForm.style.display = "block";
  calendarSection.style.display = "none";
  submitBtn.disabled = true;
}
