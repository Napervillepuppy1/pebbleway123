from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Settings
from utils.email_sender import send_verification_email
from utils.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password', 'name']):
        return jsonify({'error': 'Missing required fields'}), 400

    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400

    if not validate_password(data['password']):
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    user = User(
        email=data['email'],
        name=data['name']
    )
    user.set_password(data['password'])

    # Create default settings
    settings = Settings(user=user)

    db.session.add(user)
    db.session.add(settings)
    db.session.commit()

    # Send verification email
    send_verification_email(user)

    return jsonify({'message': 'Registration successful'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password']):
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.email_verified:
        return jsonify({'error': 'Please verify your email first'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        }
    }), 200

@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    # Implement email verification logic
    pass

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'streak': user.streak,
        'last_check_in': user.last_check_in.isoformat() if user.last_check_in else None
    }), 200 