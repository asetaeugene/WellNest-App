import os
import logging
from flask import Flask, Response, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from datetime import datetime

load_dotenv()

# IntaSend config
INTASEND_PUBLIC_KEY = os.getenv("INTASEND_PUBLIC_KEY")
INTASEND_SECRET_KEY = os.getenv("INTASEND_SECRET_KEY")
INTASEND_BASE_URL = "https://api.intasend.com/api/v1"

#DB for payments
payments = []

# --- Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')


app = Flask(__name__)
# Allow CORS for local and production frontend
frontend_origin = os.environ.get('FRONTEND_ORIGIN') or os.environ.get('VITE_FRONTEND_ORIGIN') or 'http://localhost:5173'
CORS(app, origins=[frontend_origin, 'http://localhost:5173'])

# --- Config ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
if not app.config['SQLALCHEMY_DATABASE_URI']:
    logging.error('DATABASE_URL not set in environment variables.')
    raise RuntimeError('DATABASE_URL not set.')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
if not app.config['JWT_SECRET_KEY']:
    logging.error('JWT_SECRET_KEY not set in environment variables.')
    raise RuntimeError('JWT_SECRET_KEY not set.')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
if not GEMINI_API_KEY:
    logging.warning('GEMINI_API_KEY not set. Gemini features will not work.')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- Models ---

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(64), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(120))
    is_premium = db.Column(db.Boolean, default=False)
    profile_picture = db.Column(db.String(512), default='')

class JournalEntry(db.Model):
    __tablename__ = 'journal_entry'
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    content = db.Column(db.Text, nullable=False)
    analysis_json = db.Column(db.Text)  # JSON string of analysis

    user = db.relationship('User', backref=db.backref('entries', lazy=True))

# --- Auth Endpoints ---
@app.route('/api/login', methods=['POST'])
def login() -> 'Response':
    try:
        data = request.json
        email = data.get('email', '').lower()
        password = data.get('pass')
        user = User.query.filter_by(email=email).first()
        if not user or not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid email or password.'}), 401
        token = create_access_token(identity=user.id)
        user_data = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "isPremium": user.is_premium,
            "profilePicture": user.profile_picture,
        }
        return jsonify({'token': token, 'user': user_data})
    except Exception as e:
        logging.exception("Login error")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/signup', methods=['POST'])
def signup() -> 'Response':
    try:
        data = request.json
        email = data.get('email', '').lower()
        password = data.get('pass')
        name = data.get('name', '')
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'An account with this email already exists.'}), 409
        user_id = f"user_{int(datetime.utcnow().timestamp()*1000)}"
        pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(id=user_id, email=email, password_hash=pw_hash, name=name)
        db.session.add(user)
        db.session.commit()
        token = create_access_token(identity=user.id)
        user_data = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "isPremium": user.is_premium,
            "profilePicture": user.profile_picture,
        }
        return jsonify({'token': token, 'user': user_data})
    except Exception as e:
        logging.exception("Signup error")
        return jsonify({'error': 'Internal server error'}), 500

# --- User Endpoints ---

@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user() -> 'Response':
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found.'}), 404
        user_data = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "isPremium": user.is_premium,
            "profilePicture": user.profile_picture,
        }
        return jsonify(user_data)
    except Exception as e:
        logging.exception("Get user error")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/user', methods=['PATCH'])
@jwt_required()
def update_user() -> 'Response':
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found.'}), 404
        data = request.json
        # Only allow updating name, isPremium, profilePicture
        if 'name' in data:
            user.name = data['name']
        if 'isPremium' in data:
            user.is_premium = data['isPremium']
        if 'profilePicture' in data:
            user.profile_picture = data['profilePicture']
        db.session.commit()
        user_data = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "isPremium": user.is_premium,
            "profilePicture": user.profile_picture,
        }
        return jsonify(user_data)
    except Exception as e:
        logging.exception("Update user error")
        return jsonify({'error': 'Internal server error'}), 500

# --- Journal Endpoints ---

@app.route('/api/journal', methods=['GET'])
@jwt_required()
def get_journal_entries() -> 'Response':
    try:
        user_id = get_jwt_identity()
        entries = JournalEntry.query.filter_by(user_id=user_id).order_by(JournalEntry.date.desc()).all()
        result = []
        for e in entries:
            entry_obj = {
                "id": e.id,
                "date": e.date.isoformat(),
                "content": e.content,
                "analysis": None
            }
            if e.analysis_json:
                import json
                entry_obj["analysis"] = json.loads(e.analysis_json)
            result.append(entry_obj)
        return jsonify(result)
    except Exception as e:
        logging.exception("Get journal entries error")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/journal', methods=['POST'])
@jwt_required()
def add_journal_entry() -> 'Response':
    try:
        user_id = get_jwt_identity()
        data = request.json
        content = data.get('content')
        analysis = data.get('analysis')
        entry_id = f"entry_{int(datetime.utcnow().timestamp()*1000)}"
        import json
        entry = JournalEntry(
            id=entry_id,
            user_id=user_id,
            content=content,
            analysis_json=json.dumps(analysis) if analysis else None
        )
        db.session.add(entry)
        db.session.commit()
        return jsonify({
            "id": entry.id,
            "date": entry.date.isoformat(),
            "content": entry.content,
            "analysis": analysis
        })
    except Exception as e:
        logging.exception("Add journal entry error")
        return jsonify({'error': 'Internal server error'}), 500

# --- AI Analysis Endpoint (Google Gemini) ---

@app.route('/api/analyze', methods=['POST'])
@jwt_required()
def analyze_entry() -> 'Response':
    try:
        user_id = get_jwt_identity()
        data = request.json
        text = data.get('text') or data.get('content')
        if not text:
            return jsonify({'error': 'No text provided for analysis.'}), 400

        # CALL GOOGLE GEMINI API
        gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        headers = {"Content-Type": "application/json"}
        body = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": (
                                "Analyze the emotions and sentiment of this journal entry. "
                                "Respond in this JSON format: "
                                "{\"overallSentiment\":\"<Positive|Neutral|Negative>\","
                                "\"emotions\":[{\"emotion\":\"string\",\"score\":int}],"
                                "\"summary\":\"string\",\"affirmation\":\"string\"}. "
                                "Entry: " + text
                            )
                        }
                    ]
                }
            ]
        }
        params = {"key": GEMINI_API_KEY}
        gemini_resp = requests.post(gemini_url, headers=headers, params=params, json=body)
        if gemini_resp.status_code != 200:
            logging.error(f"Gemini API error: {gemini_resp.text}")
            return jsonify({'error': 'Failed to analyze text', 'details': gemini_resp.text}), 500
        import json
        # Try to parse the JSON result from the model output
        try:
            candidates = gemini_resp.json().get('candidates', [])
            if not candidates:
                raise Exception("No candidates in Gemini response")
            text_response = candidates[0]["content"]["parts"][0]["text"]
            # Find the first JSON object in the string
            start = text_response.find('{')
            end = text_response.rfind('}')
            if start == -1 or end == -1:
                raise Exception("No JSON in Gemini response")
            json_str = text_response[start:end+1]
            analysis = json.loads(json_str)
            return jsonify(analysis)
        except Exception as e:
            logging.exception("Parsing Gemini response failed")
            return jsonify({'error': 'Parsing Gemini response failed', 'details': str(e), 'raw': gemini_resp.text}), 500
    except Exception as e:
        logging.exception("Analyze entry error")
        return jsonify({'error': 'Internal server error'}), 500

# --- IntaSend Payment Endpoints ---
@app.route('/api/intasend/initialize', methods=['POST'])
def intasend_initialize():
    data = request.json
    email = data.get('email')
    amount = data.get('amount')
    if not email or not amount:
        return jsonify({'error': 'Email and amount required'}), 400
    headers = {
        "Authorization": f"Bearer {INTASEND_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "public_key": INTASEND_PUBLIC_KEY,
        "email": email,
        "amount": amount,
        "currency": "KES",  # or "USD" or your preferred currency
        "redirect_url": data.get('redirect_url', ''),
        "comment": "WellNest Premium Payment"
    }
    resp = requests.post(f"{INTASEND_BASE_URL}/checkout/", json=payload, headers=headers)
    return jsonify(resp.json()), resp.status_code
# Verify IntaSend payment
@app.route('/api/intasend/verify/<reference>', methods=['GET'])
def intasend_verify(reference):
    headers = {
        "Authorization": f"Bearer {INTASEND_SECRET_KEY}"
    }
    resp = requests.get(f"{INTASEND_BASE_URL}/checkout/{reference}/", headers=headers)
    result = resp.json()
    # Save to DB and set user as premium if successful
    if result.get('status') == 'PAID':
        email = result.get('email')
        payments.append({
            'email': email,
            'amount': result.get('amount'),
            'reference': reference,
            'status': 'success'
        })
        # Set user as premium in DB
        from flask import current_app
        db = current_app.extensions['sqlalchemy'].db
        User = db.Model._decl_class_registry.get('User')
        if User:
            user = User.query.filter_by(email=email).first()
            if user:
                user.is_premium = True
                db.session.commit()
    return jsonify(result), resp.status_code
# IntaSend webhook endpoint
@app.route('/api/intasend/webhook', methods=['POST'])
def intasend_webhook():
    event = request.json
    # Handle event types (e.g., payment confirmation)
    # Save or update payment status in DB
    return '', 200
    
    # --- Initialize DB ---
with app.app_context():
    try:
        db.create_all()
    except Exception as e:
        logging.exception("Database initialization error")

# --- Main ---

@app.errorhandler(Exception)
def handle_exception(e):
    logging.exception("Unhandled exception")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=False)
