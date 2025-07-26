// script.js

document.addEventListener("DOMContentLoaded", function () {
  const infoForm = document.getElementById("info-form");
  const schedulingSection = document.getElementById("scheduling-section");
  const appointmentForm = document.getElementById("appointment-form");
  const calendarDiv = document.getElementById("calendar");
  const visitMsg = document.getElementById("visit-messages");

  let selectedDate = null;
  let secondDate = null;
  let napTime = null;

  // Step 1: Capture info form
  infoForm.addEventListener("submit", function (e) {
    e.preventDefault();
    napTime = document.getElementById("naptime").value;
    if (!napTime) return alert("Please enter a nap time.");
    schedulingSection.style.display = "block";
    infoForm.style.display = "none";
    renderCalendar();
  });

  // Render calendar for current and next month
  function renderCalendar() {
    const today = new Date();
    const container = document.createElement("div");
    container.className = "calendar-grid";
    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const day = document.createElement("div");
      day.className = "calendar-day";
      day.textContent = date.getDate();
      day.dataset.date = date.toISOString().split("T")[0];
      day.addEventListener("click", () => handleDateClick(date, day));
      container.appendChild(day);
    }
    calendarDiv.innerHTML = "";
    calendarDiv.appendChild(container);
  }

  // Handle date selection
  function handleDateClick(dateObj, element) {
    const allDays = document.querySelectorAll(".calendar-day");
    allDays.forEach((el) => el.classList.remove("selected", "selectable"));

    if (!selectedDate) {
      selectedDate = dateObj;
      element.classList.add("selected");
      visitMsg.innerText = `Your Visit 1 date is ${selectedDate.toDateString()}`;
      document.getElementById("visit1").value = selectedDate.toISOString().split("T")[0];

      // Allow second visit only one week apart
      allDays.forEach((el) => {
        const thisDate = new Date(el.dataset.date);
        const diffDays = Math.abs((thisDate - selectedDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 7) {
          el.classList.add("selectable");
          el.addEventListener("click", () => {
            secondDate = thisDate;
            el.classList.add("selected");
            visitMsg.innerText += `\nYour Visit 2 date is ${secondDate.toDateString()}`;
            document.getElementById("visit2").value = secondDate.toISOString().split("T")[0];

            // Calculate times
            const [napHour, napMin] = napTime.split(":").map(Number);
            const visitHour = (napHour + 24 - 2) % 24;
            const timeStr = `${visitHour.toString().padStart(2, "0")}:${napMin.toString().padStart(2, "0")}`;

            document.getElementById("final-visit1").value = selectedDate.toISOString().split("T")[0];
            document.getElementById("final-visit2").value = secondDate.toISOString().split("T")[0];
            document.getElementById("final-time1").value = timeStr;
            document.getElementById("final-time2").value = timeStr;
            document.getElementById("appointment-form").submit();
          });
        }
      });
    }
  }

  document.getElementById("clear-selection").addEventListener("click", () => {
    selectedDate = null;
    secondDate = null;
    renderCalendar();
    visitMsg.innerText = "";
  });

  // Final submission handler (for display only)
  appointmentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("parent-name").value;
    const email = document.getElementById("parent-email").value;
    const visit1 = document.getElementById("final-visit1").value;
    const visit2 = document.getElementById("final-visit2").value;
    const time = document.getElementById("final-time1").value;

    document.getElementById("message").innerHTML =
      `Thanks, ${name}!<br>Your appointments are confirmed for:<br>` +
      `Visit 1: ${visit1} at ${time}<br>` +
      `Visit 2: ${visit2} at ${time}`;
  });
});
