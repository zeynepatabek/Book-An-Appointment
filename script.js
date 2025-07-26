document.addEventListener("DOMContentLoaded", function () {
  const infoForm = document.getElementById("info-form");
  const calendarSection = document.getElementById("calendar-section");
  const calendarContainer = document.getElementById("calendar");
  const selectedDatesDisplay = document.getElementById("selected-dates");
  const messageDiv = document.getElementById("message");
  const clearSelectionBtn = document.getElementById("clear-selection");

  let selectedDates = [];
  let napTime = "";

  infoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    napTime = document.getElementById("nap-time").value;
    if (!napTime) {
      alert("Please enter the child's typical nap time.");
      return;
    }

    console.log("Info form submitted, proceeding to calendar...");

    infoForm.style.display = "none";
    calendarSection.style.display = "block";

    renderCalendar();
  });

  clearSelectionBtn.addEventListener("click", function () {
    selectedDates = [];
    selectedDatesDisplay.innerHTML = "";
    messageDiv.innerHTML = "";
    highlightDates();
  });

  function renderCalendar() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const calendarTable = document.createElement("table");
    calendarTable.classList.add("calendar-table");

    const headerRow = document.createElement("tr");
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
      const th = document.createElement("th");
      th.textContent = day;
      headerRow.appendChild(th);
    });
    calendarTable.appendChild(headerRow);

    let row = document.createElement("tr");
    for (let i = 0; i < firstDay.getDay(); i++) {
      row.appendChild(document.createElement("td"));
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const currentDate = new Date(year, month, d);
      const cell = document.createElement("td");
      cell.textContent = d;
      cell.dataset.date = currentDate.toISOString().split('T')[0];
      cell.classList.add("calendar-cell");

      cell.addEventListener("click", function () {
        const clickedDate = new Date(this.dataset.date);

        if (selectedDates.length === 0) {
          selectedDates.push(clickedDate);
          highlightDates();
        } else if (selectedDates.length === 1) {
          const firstDate = selectedDates[0];
          const diffDays = Math.abs((clickedDate - firstDate) / (1000 * 60 * 60 * 24));

          if (diffDays >= 6 && diffDays <= 8) {
            selectedDates.push(clickedDate);
            highlightDates();
            displayAppointmentInfo();
          } else {
            alert("Second visit must be within ±1 week of the first visit.");
          }
        }
      });

      row.appendChild(cell);
      if ((firstDay.getDay() + d) % 7 === 0) {
        calendarTable.appendChild(row);
        row = document.createElement("tr");
      }
    }
    calendarTable.appendChild(row);

    calendarContainer.innerHTML = `<h3>${today.toLocaleString('default', { month: 'long' })} ${year}</h3>`;
    calendarContainer.appendChild(calendarTable);
  }

  function highlightDates() {
    const allCells = document.querySelectorAll(".calendar-cell");
    allCells.forEach(cell => cell.classList.remove("selected"));

    selectedDates.forEach(date => {
      const iso = date.toISOString().split('T')[0];
      const match = [...allCells].find(c => c.dataset.date === iso);
      if (match) match.classList.add("selected");
    });
  }

  function displayAppointmentInfo() {
    const parentName = document.getElementById("parent-name").value;
    const childName = document.getElementById("child-name").value;

    const visit1 = selectedDates[0] < selectedDates[1] ? selectedDates[0] : selectedDates[1];
    const visit2 = selectedDates[0] > selectedDates[1] ? selectedDates[0] : selectedDates[1];

    const napHour = parseInt(napTime.split(":")[0]);
    const napMinute = parseInt(napTime.split(":")[1]);

    let visitHour = napHour;
    let visitMinute = napMinute - 15;
    if (visitMinute < 0) {
      visitMinute += 60;
      visitHour = (visitHour + 23) % 24;
    } else {
      visitHour = (visitHour + 24 - 2) % 24;
    }

    const visitTime = `${visitHour.toString().padStart(2, '0')}:${visitMinute.toString().padStart(2, '0')}`;

    selectedDatesDisplay.innerHTML = `
      <p><strong>Your Visit 1 date is:</strong> ${visit1.toDateString()} at ${visitTime}</p>
      <p><strong>Your Visit 2 date is:</strong> ${visit2.toDateString()} at ${visitTime}</p>
    `;

    messageDiv.innerHTML = `
      <p>Thank you, ${parentName}. ${childName}'s visits are scheduled as shown above.</p>
    `;
  }
});
