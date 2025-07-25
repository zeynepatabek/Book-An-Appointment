document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("appointment-form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!date || !time) {
      alert("Please select both a date and time.");
      return;
    }

    const datetime = `${date}T${time}`;

    setTimeout(function () {
      var messageDiv = document.getElementById("message");
      messageDiv.innerHTML = `Thanks, ${name}! Your appointment is booked for ${date} at ${time}.`;
      messageDiv.style.color = "green";

      console.log("Appointment info:", {
        name,
        email,
        datetime
      });

      form.reset();
    }, 1000);
  });
});
