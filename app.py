from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
# CORS 설정: 프론트엔드(웹 브라우저)에서 오는 요청을 허용해 줌!
CORS(app)

DB_FILE = 'users.json'

def load_data():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# --- API 주소들 ---

@app.route('/')
def home():
    return "🚀 렌더 서버가 정상적으로 작동 중입니다!"

@app.route('/save', methods=['POST'])
def save_score():
    req_data = request.get_json()
    username = req_data.get('username')
    points = req_data.get('points')
    
    if not username or points is None:
        return jsonify({"error": "아이디와 포인트를 모두 보내주세요!"}), 400
    
    db = load_data()
    db[username] = points
    save_data(db)
    
    return jsonify({"message": f"{username}님의 데이터가 저장되었습니다.", "points": points})

@app.route('/load/<username>', methods=['GET'])
def get_score(username):
    db = load_data()
    if username in db:
        return jsonify({"username": username, "points": db[username]})
    else:
        return jsonify({"error": "해당 유저를 찾을 수 없습니다."}), 404

@app.route('/ranking', methods=['GET'])
def get_ranking():
    db = load_data()
    sorted_ranking = sorted(db.items(), key=lambda item: item[1], reverse=True)
    ranking_list = [{"username": k, "points": v} for k, v in sorted_ranking]
    return jsonify(ranking_list)

if __name__ == '__main__':
    app.run(debug=True, port=5000)