from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
# 프론트엔드 통신 허가
CORS(app)

DB_FILE = 'users.json'

def load_data():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except:
            return {}

def save_data(data):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

@app.route('/')
def home():
    return "🚀 렌더 서버가 정상적으로 작동 중입니다! (회원가입/로그인 지원 완료)"

# --- 📝 1. 회원가입 API ---
@app.route('/signup', methods=['POST'])
def signup():
    req_data = request.get_json()
    username = req_data.get('username')
    password = req_data.get('password')

    if not username or not password:
        return jsonify({"error": "아이디와 비밀번호를 모두 입력해주세요!"}), 400

    db = load_data()
    
    # 이미 있는 아이디인지 검사
    if username in db:
        return jsonify({"error": "이미 존재하는 아이디입니다. 다른 아이디를 써주세요."}), 409

    # 새 유저 저장 (가입 축하금 1000포인트 기본 지급!)
    db[username] = {
        "password": password,
        "points": 1000
    }
    save_data(db)
    
    return jsonify({"message": f"{username}님 회원가입 성공!"}), 201

# --- 🔒 2. 로그인 API ---
@app.route('/login', methods=['POST'])
def login():
    req_data = request.get_json()
    username = req_data.get('username')
    password = req_data.get('password')

    db = load_data()

    # 아이디가 없는 경우
    if username not in db:
        return jsonify({"error": "존재하지 않는 아이디입니다."}), 404
        
    # 비밀번호가 틀린 경우
    if db[username]["password"] != password:
        return jsonify({"error": "비밀번호가 틀렸습니다."}), 401

    # 로그인 성공 시 현재 보유 중인 포인트도 같이 던져줌
    return jsonify({
        "message": "로그인 성공!",
        "points": db[username]["points"]
    }), 200

# --- 💾 3. 점수 저장 API (업데이트) ---
@app.route('/save', methods=['POST'])
def save_score():
    req_data = request.get_json()
    username = req_data.get('username')
    points = req_data.get('points')
    
    db = load_data()
    if username in db:
        db[username]["points"] = points
        save_data(db)
        return jsonify({"message": "점수 저장 완료"})
        
    return jsonify({"error": "유저를 찾을 수 없습니다."}), 404

# --- 🏆 4. 전체 랭킹 API (업데이트) ---
@app.route('/ranking', methods=['GET'])
def get_ranking():
    db = load_data()
    # 점수를 기준으로 내림차순(1등부터) 정렬
    sorted_ranking = sorted(db.items(), key=lambda item: item[1]["points"], reverse=True)
    
    # 프론트엔드가 쓰기 편하게 리스트로 묶어서 반환
    ranking_list = [{"name": k, "points": v["points"]} for k, v in sorted_ranking]
    return jsonify(ranking_list)

if __name__ == '__main__':
    app.run(debug=True, port=5000)