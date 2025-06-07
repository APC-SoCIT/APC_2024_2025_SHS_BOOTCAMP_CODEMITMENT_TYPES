from flask import Flask, render_template, request, jsonify, session
from database import Database
from text_generator import TextGenerator
from auth import AuthService
import time
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# Initialize services
db = Database()
text_gen = TextGenerator()
auth = AuthService(db)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/start-test', methods=['POST'])
def start_test():
    session['test_start'] = time.time()
    session['test_text'] = text_gen.get_random_text()
    return jsonify({'text': session['test_text']})

@app.route('/api/submit-test', methods=['POST'])
def submit_test():
    data = request.json
    typed_text = data['typedText']
    original_text = session['test_text']
    
    # Calculate results
    elapsed = time.time() - session['test_start']
    wpm = calculate_wpm(original_text, elapsed)
    accuracy = calculate_accuracy(original_text, typed_text)
    
    # Save results
    user_id = session.get('user_id')
    if user_id:
        db.save_result(user_id, wpm, accuracy, original_text)
    
    return jsonify({
        'wpm': wpm,
        'accuracy': accuracy,
        'testDate': datetime.now().isoformat()
    })

def calculate_wpm(text, seconds):
    words = len(text.split())
    minutes = seconds / 60
    return round(words / minutes, 2)

def calculate_accuracy(original, typed):
    correct = sum(1 for o, t in zip(original, typed) if o == t)
    return round((correct / len(original)) * 100, 2)

if __name__ == '__main__':
    app.run(debug=True)