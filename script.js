const form = document.getElementById("info-form");
const calendarSection = document.getElementById("calendar-section");
const calendarDiv = document.getElementById("calendar");
const selectedDatesDiv = document.getElementById("selected-dates");
const messageDiv = document.getElementById("message");
const clearBtn = document.getElementById("clear-selection");

let firstSelectedDate = null;
let secondSelectedDate = null;
let availableDates = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  calendarSection.style.display = "block";
  renderCalendars();
});

// Get today's date and generate two months of calendar
function renderCalendars() {
  calendarDiv.innerHTML = "";

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  renderCalendar(currentMonth, currentYear);
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  renderCalendar(nextMonth, nextYear);
}

function renderCalendar(month, year) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const table = document.createElement("table");
  table.className = "calendar-table";

  const caption = document.createElement("caption");
  caption.textContent = `${new Date(year, month).toLocaleString("default", { month: "long" })} ${year}`;
  table.appendChild(caption);

  const headerRow = document.createElement("tr");
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  let date = 1;
  for (let i = 0; i < 6 && date <= daysInMonth; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");

      if (i === 0 && j < firstDay) {
        cell.textContent = "";
      } else if (date <= daysInMonth) {
        const current = new Date(year, month, date);
        const iso = current.toISOString().split("T")[0];

        cell.textContent = date;

        if (!firstSelectedDate || isValidSecondDate(current)) {
          cell.classList.add(firstSelectedDate ? "light-blue" : "available");

          cell.addEventListener("click", () => handleDateClick(current));
        } else {
          cell.classList.add("greyed");
        }

        if (firstSelectedDate && isSameDate(current, firstSelectedDate)) {
          cell.classList.add("selected");
        }
        if (secondSelectedDate && isSameDate(current, secondSelectedDate)) {
          cell.classList.add("selected");
        }

        date++;
      }

      row.appendChild(cell);
    }

    table.appendChild(row);
  }

  calendarDiv.appendChild(table);
}

function handleDateClick(date) {
  if (!firstSelectedDate) {
    firstSelectedDate = date;
    renderCalendars();
    selectedDatesDiv.textContent = "First visit selected: " + formatDate(date);
    messageDiv.textContent = "Now select a second visit 6–8 days before or after.";
  } else if (!secondSelectedDate && isValidSecondDate(date)) {
    secondSelectedDate = date;
    selectedDatesDiv.innerHTML = `
      <p>First Visit: ${formatDate(firstSelectedDate)}</p>
      <p>Second Visit: ${formatDate(secondSelectedDate)}</p>
    `;

    const napTime = document.getElementById("nap-time").value;
    const visit1 = calculateVisitTime(firstSelectedDate, napTime);
    const visit2 = calculateVisitTime(secondSelectedDate, napTime);

    messageDiv.innerHTML = `
      <strong>Visit Times:</strong><br>
      Visit 1: ${visit1}<br>
      Visit 2: ${visit2}
    `;

    setTimeout(() => {
      window.location.href = "confirmation.html";
    }, 3000);
  }
}

function calculateVisitTime(date, napTime) {
  const [napHour, napMinute] = napTime.split(":").map(Number);
  const nap = new Date(date);
  nap.setHours(napHour);
  nap.setMinutes(napMinute);
  nap.setMinutes(nap.getMinutes() - 135); // 2hr 15min before

  return nap.toLocaleString();
}

function isValidSecondDate(date) {
  const diff = Math.abs((date - firstSelectedDate) / (1000 * 60 * 60 * 24));
  return diff >= 6 && diff <= 8;
}

function isSameDate(a, b) {
  return a.toDateString() === b.toDateString();
}

function formatDate(date) {
  return date.toDateString();
}

clearBtn.addEventListener("click", () => {
  firstSelectedDate = null;
  secondSelectedDate = null;
  selectedDatesDiv.textContent = "";
  messageDiv.textContent = "";
  renderCalendars();
});
