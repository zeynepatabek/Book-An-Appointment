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
    document.getElementById("info-form").style.display = "none";
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
