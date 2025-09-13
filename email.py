from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)

SOMNEURO_EMAIL = "somneuro-dev@umass.edu"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "your_email@gmail.com"
SMTP_PASS = "your_app_password"  # Use an app password if using Gmail

@app.route("/book", methods=["POST"])
def book_appointment():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    date = data.get("date")
    time = data.get("time")

    message = f"""
    New Appointment Booking:

    Name: {name}
    Email: {email}
    Date: {date}
    Time: {time}
    """

    try:
        send_email(SOMNEURO_EMAIL, "New Appointment Booking", message)
        return jsonify({"status": "success", "message": "Appointment sent to Somneuro Lab!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def send_email(to_email, subject, body):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, to_email, msg.as_string())


if __name__ == "__main__":
    app.run(debug=True)

