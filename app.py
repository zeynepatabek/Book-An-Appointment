from flask import Flask, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = Flask(__name__)

# Configure email server (using Gmail as example)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "your-email@gmail.com"  # replace with your email
SENDER_PASSWORD = os.environ.get("EMAIL_PASSWORD")  # store in env variable!

@app.route("/send-email", methods=["POST"])
def send_email():
    data = request.json

    parent_name = data.get("parentName")
    parent_email = data.get("parentEmail")
    child_name = data.get("childName")
    nap_time = data.get("napTime")
    selected_dates = data.get("selectedDates", [])

    # Build email content
    subject = f"New Appointment Request from {parent_name}"
    body = f"""
    You have received a new appointment request:

    👤 Parent Name: {parent_name}
    📧 Parent Email: {parent_email}
    🧒 Child Name: {child_name}
    😴 Nap Time: {nap_time}

    📅 Selected Dates:
    - {selected_dates[0] if len(selected_dates) > 0 else "N/A"}
    - {selected_dates[1] if len(selected_dates) > 1 else "N/A"}

    Please follow up with the parent to confirm availability.
    """

    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = "somneuro-dev@umass.edu"
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, "somneuro-dev@umass.edu", msg.as_string())

        return jsonify({"success": True, "message": "Email sent successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
