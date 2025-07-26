document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("appointment-form");
  const calendarEl = document.getElementById('calendar');
  const hiddenDateInput = document.getElementById('date');
  const clearBtn = document.getElementById('clear-selection');

  // Calendar range and month setup
  const rangeStart = new Date(2025, 6, 10); // July 10, 2025
  const rangeEnd = new Date(2025, 6, 20);   // July 20, 2025
  const year = 2025;
  const month = 6; // July (0-indexed)

  let selectedDate = null;

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function inRange(date, start, end) {
    return date >= start && date <= end;
  }

  function renderCalendar() {
    calendarEl.innerHTML = '';

    // Weekday headers
    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    weekdays.forEach(day => {
      const wd = document.createElement('div');
      wd.textContent = day;
      wd.style.fontWeight = 'bold';
      wd.style.textAlign = 'center';
      calendarEl.appendChild(wd);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    // Empty cells for alignment
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarEl.appendChild(document.createElement('div'));
    }

    for (let dayNum = 1; dayNum <= lastDay.getDate(); dayNum++) {
      const dayDate = new Date(year, month, dayNum);
      const dayEl = document.createElement('div');
      dayEl.textContent = dayNum;
      dayEl.classList.add('day');

      // Blue range highlight
      if (inRange(dayDate, rangeStart, rangeEnd)) {
        dayEl.classList.add('range');
      }

      // Disable days logic when selectedDate exists
      if (selectedDate) {
        const oneWeekBefore = new Date(selectedDate);
        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
        const oneWeekAfter = new Date(selectedDate);
        oneWeekAfter.setDate(oneWeekAfter.getDate() + 7);

        if (!(
          isSameDay(dayDate, selectedDate) ||
          isSameDay(dayDate, oneWeekBefore) ||
          isSameDay(dayDate, oneWeekAfter)
        )) {
          dayEl.classList.add('disabled');
        }
      }

      // Selected day styling
      if (selectedDate && isSameDay(dayDate, selectedDate)) {
        dayEl.classList.add('selected');
      }

      // Clickable if not disabled
      if (!dayEl.classList.contains('disabled')) {
        dayEl.addEventListener('click', () => {
          selectedDate = dayDate;
          hiddenDateInput.value = formatDate(selectedDate);
          renderCalendar();
        });
      }

      calendarEl.appendChild(dayEl);
    }
  }

  renderCalendar();

  // Clear selection button handler
  clearBtn.addEventListener('click', () => {
    selectedDate = null;
    hiddenDateInput.value = '';
    renderCalendar();
  });

  // Form submission handler
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const date = hiddenDateInput.value;
    const time = document.getElementById("time").value;

    if (!date || !time) {
      alert("Please select both a date and time.");
      return;
    }

    const datetime = `${date}T${time}`;

    setTimeout(function () {
      const messageDiv = document.getElementById("message");
      messageDiv.innerHTML = `Thanks, ${name}! Your appointment is booked for ${date} at ${time}.`;
      messageDiv.style.color = "green";

      console.log("Appointment info:", {
        name,
        email,
        datetime
      });

      form.reset();
      // Reset calendar selection
      selectedDate = null;
      hiddenDateInput.value = '';
      renderCalendar();
    }, 1000);
  });
});
