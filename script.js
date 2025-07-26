let parentInfo = {};
let availableDates = [];

// Fetch available dates from plain text file (one date per line)
fetch('available_dates.txt')
  .then(response => response.text())
  .then(text => {
    availableDates = text
      .split('\n')              // Split lines
      .map(line => line.trim()) // Trim spaces
      .filter(line => line)     // Remove empty lines
      .map(d => {
        const dt = new Date(d);
        dt.setHours(0,0,0,0);   // Normalize time part
        return dt;
      });
    setup();
  })
  .catch(err => {
    alert("Failed to load available dates.");
    console.error(err);
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
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(dayName => {
    const th = document.createElement("th");
    th.textContent = dayName;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  let totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;
  let dayNum = 1;

  for (let i=0; i<totalCells; i++) {
    if (i % 7 === 0) {
      var row = document.createElement("tr");
      table.appendChild(row);
    }

    const cell = document.createElement("td");

    if (i >= startDay && dayNum <= daysInMonth) {
      let cellDate = new Date(year, month, dayNum);
      cellDate.setHours(0,0,0,0);

      const isAvail = availableDates.some(d => datesEqual(d, cellDate));
      cell.textContent = dayNum;

      if (!isAvail) {
        cell.classList.add("greyed");
      } else {
        if (selectedDates.some(d => datesEqual(d, cellDate))) {
          cell.classList.add("selected");
        } else if (selectedDates.length === 1) {
          const diffDays = Math.floor((cellDate - selectedDates[0]) / (1000*60*60*24));
          if ((diffDays >= 6 && diffDays <= 8) || (diffDays <= -6 && diffDays >= -8)) {
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
      cell.textContent = "";
      cell.classList.add("greyed");
    }
    row.appendChild(cell);
  }
  container.appendChild(table);
}

function onDateClick(date) {
  if (selectedDates.length === 0) {
    selectedDates.push(date);
    updateCalendars();
    updateSelectedDatesText();
    submitBtn.disabled = true;
  } else if (selectedDates.length === 1) {
    const diffDays = Math.abs(Math.floor((date - selectedDates[0]) / (1000*60*60*24)));
    if (diffDays >= 6 && diffDays <= 8) {
      selectedDates.push(date);
      updateCalendars();
      updateSelectedDatesText();
      submitBtn.disabled = false;
    } else {
      alert("Second visit must be 6 to 8 days before or after the first visit.");
    }
  }
}

function updateCalendars() {
  const today = new Date();
  const month1 = new Date(today.getFullYear(), today.getMonth(), 1);
  const month2 = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  renderCalendar(calendarMonth1, month1.getFullYear(), month1.getMonth());
  renderCalendar(calendarMonth2, month2.getFullYear(), month2.getMonth());
}

function updateSelectedDatesText() {
  if (selectedDates.length === 0) {
    selectedDatesDiv.innerHTML = "<p>No dates selected yet.</p>";
  } else if (selectedDates.length === 1) {
    selectedDatesDiv.innerHTML = `<p>Your Visit 1 date is <strong>${selectedDates[0].toDateString()}</strong></p>`;
  } else {
    const sorted = selectedDates.slice().sort((a,b) => a - b);
    selectedDatesDiv.innerHTML = `<p>Your Visit 1 date is <strong>${sorted[0].toDateString()}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; Your Visit 2 date is <strong>${sorted[1].toDateString()}</strong></p>`;
  }
}

clearBtn.addEventListener("click", () => {
  selectedDates = [];
  updateCalendars();
  updateSelectedDatesText();
  submitBtn.disabled = true;
});

infoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  parentInfo = {
    parentName: document.getElementById("parent-name").value.trim(),
    parentEmail: document.getElementById("parent-email").value.trim(),
    childName: document.getElementById("child-name").value.trim(),
    napTime: document.getElementById("nap-time").value
  };

  if(!parentInfo.parentName || !parentInfo.parentEmail || !parentInfo.childName || !parentInfo.napTime){
    alert("Please fill in all the fields.");
    return;
  }

  // Hide form, show calendar
  infoForm.style.display = "none";
  calendarSection.style.display = "block";

  updateCalendars();
  updateSelectedDatesText();
});

submitBtn.addEventListener("click", () => {
  if (selectedDates.length !== 2) {
    alert("Please select two visit dates.");
    return;
  }

  // Store info in localStorage to pass to confirmation.html if needed
  localStorage.setItem('parentInfo', JSON.stringify(parentInfo));
  localStorage.setItem('selectedDates', JSON.stringify(selectedDates.map(d => d.toISOString())));

  // Redirect to confirmation page
  window.location.href = "confirmation.html";
});

function setup(){
  // Initial UI state
  infoForm.style.display = "block";
  calendarSection.style.display = "none";
  submitBtn.disabled = true;
  updateSelectedDatesText();
}
