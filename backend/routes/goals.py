from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Goal, User
from datetime import datetime

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = get_jwt_identity()
    goals = Goal.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': goal.id,
        'title': goal.title,
        'category': goal.category,
        'description': goal.description,
        'target': goal.target,
        'current': goal.current,
        'completed': goal.completed,
        'created_at': goal.created_at.isoformat()
    } for goal in goals]), 200

@goals_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not all(k in data for k in ['title', 'target']):
        return jsonify({'error': 'Missing required fields'}), 400

    goal = Goal(
        user_id=user_id,
        title=data['title'],
        category=data.get('category'),
        description=data.get('description'),
        target=data['target']
    )

    db.session.add(goal)
    db.session.commit()

    return jsonify({
        'id': goal.id,
        'title': goal.title,
        'category': goal.category,
        'description': goal.description,
        'target': goal.target,
        'current': goal.current,
        'completed': goal.completed,
        'created_at': goal.created_at.isoformat()
    }), 201

@goals_bp.route('/<int:goal_id>/check-in', methods=['POST'])
@jwt_required()
def check_in(goal_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    if goal.completed:
        return jsonify({'error': 'Goal already completed'}), 400

    today = datetime.utcnow().date()
    if user.last_check_in and user.last_check_in.date() == today:
        return jsonify({'error': 'Already checked in today'}), 400

    goal.current += 1
    if goal.current >= goal.target:
        goal.completed = True

    user.streak += 1
    user.last_check_in = datetime.utcnow()

    db.session.commit()

    return jsonify({
        'current': goal.current,
        'completed': goal.completed,
        'streak': user.streak
    }), 200

@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()

    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    db.session.delete(goal)
    db.session.commit()

    return jsonify({'message': 'Goal deleted successfully'}), 200 