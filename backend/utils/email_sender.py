from flask import current_app
from flask_mail import Message
from models import db, User
import jwt
from datetime import datetime, timedelta

def send_verification_email(user):
    token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        },
        current_app.config['JWT_SECRET_KEY'],
        algorithm='HS256'
    )

    msg = Message(
        'Verify your email',
        recipients=[user.email]
    )
    msg.body = f'''To verify your email, visit the following link:
{current_app.config['FRONTEND_URL']}/verify-email/{token}

If you did not make this request then simply ignore this email.
'''
    current_app.extensions['mail'].send(msg)

def send_reminder_email(user, goals):
    msg = Message(
        'Daily Goal Reminder',
        recipients=[user.email]
    )
    msg.body = f'''Hello {user.name},

Here are your goals for today:
{chr(10).join([f"- {goal.title}: {goal.current}/{goal.target}" for goal in goals])}

Keep up the good work!
'''
    current_app.extensions['mail'].send(msg) 