from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Settings, User

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    user_id = get_jwt_identity()
    settings = Settings.query.filter_by(user_id=user_id).first()
    
    if not settings:
        return jsonify({'error': 'Settings not found'}), 404

    return jsonify({
        'theme': settings.theme,
        'font_size': settings.font_size,
        'daily_reminders': settings.daily_reminders,
        'reminder_time': settings.reminder_time
    }), 200

@settings_bp.route('/', methods=['PUT'])
@jwt_required()
def update_settings():
    user_id = get_jwt_identity()
    settings = Settings.query.filter_by(user_id=user_id).first()
    data = request.get_json()

    if not settings:
        return jsonify({'error': 'Settings not found'}), 404

    if 'theme' in data:
        settings.theme = data['theme']
    if 'font_size' in data:
        settings.font_size = data['font_size']
    if 'daily_reminders' in data:
        settings.daily_reminders = data['daily_reminders']
    if 'reminder_time' in data:
        settings.reminder_time = data['reminder_time']

    db.session.commit()

    return jsonify({
        'theme': settings.theme,
        'font_size': settings.font_size,
        'daily_reminders': settings.daily_reminders,
        'reminder_time': settings.reminder_time
    }), 200 