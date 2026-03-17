// ==========================================
// 🌍 진짜 서버 주소 설정 
// ==========================================
const SERVER_URL = "https://game-event-jypark8084.onrender.com";

let currentUserId = ""; 
let points = 0; 

// --- 화면 전환 ---
function showSignupScreen() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("signupScreen").style.display = "block";
}

function showLoginScreen() {
    document.getElementById("signupScreen").style.display = "none";
    document.getElementById("loginScreen").style.display = "block";
}

// ==========================================
// 📝 [A] 회원가입 (서버 통신)
// ==========================================
async function processSignup() {
    const idInput = document.getElementById("newId").value;
    const pwInput = document.getElementById("newPw").value;
    const pwConfirmInput = document.getElementById("newPwConfirm").value;

    if (!idInput || !pwInput) { alert("아이디와 비밀번호를 모두 입력해주세요!"); return; }
    if (pwInput !== pwConfirmInput) { alert("비밀번호가 일치하지 않습니다!"); return; }

    try {
        const response = await fetch(`${SERVER_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: idInput, password: pwInput })
        });
        const data = await response.json();

        if (response.ok) {
            alert(data.message); // 가입 성공!
            document.getElementById("newId").value = "";
            document.getElementById("newPw").value = "";
            document.getElementById("newPwConfirm").value = "";
            showLoginScreen();
        } else {
            alert(data.error); // 실패 (중복 아이디 등)
        }
    } catch (error) {
        alert("서버 오류! 서버가 켜져 있는지 확인하세요.");
    }
}

// ==========================================
// 🔒 [B] 로그인 (서버 검증 필수!)
// ==========================================
async function processLogin() {
    const idInput = document.getElementById("userId").value;
    const pwInput = document.getElementById("userPw").value;

    if (!idInput || !pwInput) { alert("아이디와 비밀번호를 모두 입력해주세요!"); return; }

    try {
        const response = await fetch(`${SERVER_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: idInput, password: pwInput })
        });
        const data = await response.json();

        if (response.ok) {
            // 서버가 허락했을 때만 화면이 넘어감!
            currentUserId = idInput;
            points = data.points; 
            
            document.getElementById("displayUsername").innerText = currentUserId; 
            document.getElementById("currentPoints").innerText = points;

            document.getElementById("loginScreen").style.display = "none";
            document.getElementById("mainGameScreen").style.display = "flex";

            // 로그인 성공 시 서버에서 진짜 랭킹 가져오기
            fetchRanking();
        } else {
            // 없는 아이디거나 비밀번호 틀리면 여기서 컷!
            alert(`로그인 실패: ${data.error}`);
        }
    } catch (error) {
        alert("서버 접속 실패! 서버 상태를 확인해주세요.");
    }
}

// ==========================================
// 🏆 [C] 진짜 랭킹 시스템
// ==========================================
async function fetchRanking() {
    try {
        const response = await fetch(`${SERVER_URL}/ranking`);
        const rankData = await response.json();
        renderRanking(rankData);
    } catch (error) {
        console.error("랭킹 오류", error);
    }
}

function renderRanking(rankings) {
    const topList = document.getElementById('topRankList');
    const extraList = document.getElementById('extraRankList');
    const toggleBtn = document.getElementById('toggleRankBtn');

    topList.innerHTML = ''; extraList.innerHTML = '';

    // 서버에 유저가 아예 없을 때의 방어 로직
    if (rankings.length === 0) {
        topList.innerHTML = '<li class="rank-item" style="justify-content:center; color:#888;">아직 랭킹이 없습니다.</li>';
        toggleBtn.style.display = 'none';
        return;
    }

    rankings.forEach((user, index) => {
        const rank = index + 1;
        const li = document.createElement('li');
        li.className = 'rank-item';
        
        if (rank === 1) li.classList.add('rank-1');
        else if (rank === 2) li.classList.add('rank-2');
        else if (rank === 3) li.classList.add('rank-3');

        li.innerHTML = `<span>${rank}. ${user.name}</span> <span>${user.points.toLocaleString()} P</span>`;

        if (rank <= 5) topList.appendChild(li);
        else extraList.appendChild(li);
    });

    if (rankings.length <= 5) toggleBtn.style.display = 'none';
    else toggleBtn.style.display = 'inline-block';
}

function toggleRanking() {
    const hiddenContainer = document.getElementById('hiddenRankContainer');
    const toggleBtn = document.getElementById('toggleRankBtn');
    
    if (hiddenContainer.style.display === 'none') {
        hiddenContainer.style.display = 'block';
        toggleBtn.innerText = '▲ 랭킹 접기';
    } else {
        hiddenContainer.style.display = 'none';
        toggleBtn.innerText = '▼ 랭킹 더 보기';
    }
}

// ==========================================
// 💾 [D] 점수 서버 저장 및 게임 로직
// ==========================================
async function savePointsToServer() {
    try {
        await fetch(`${SERVER_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUserId, points: points })
        });
        fetchRanking(); // 갱신
    } catch(e) { console.error(e); }
}

const minBet = 100;
const maxBet = 500;
let isPlaying = false; 

function playGame(userChoice) {
    if (isPlaying) return;

    const betInput = document.getElementById("betAmount").value;
    const bet = parseInt(betInput);

    if (isNaN(bet)) { alert("배팅 금액을 입력해주세요!"); return; }
    if (bet < minBet || bet > maxBet) { alert(`배팅은 ${minBet}부터 ${maxBet}까지만 가능합니다.`); return; }
    if (bet > points) { alert("포인트가 부족합니다!"); return; }

    isPlaying = true;
    document.getElementById("btnOdd").disabled = true;
    document.getElementById("btnEven").disabled = true;
    document.getElementById("resultMessage").innerHTML = `<span class="rolling">결과를 확인하는 중... 🎲</span>`;

    setTimeout(() => {
        const randomNum = Math.floor(Math.random() * 2); 
        const gameResult = (randomNum === 0) ? '짝' : '홀';

        let resultMsg = `결과는 [${gameResult}]! <br>`;
        if (userChoice === gameResult) {
            points += bet;
            resultMsg += `<span style="color:#66bb6a;">+${bet}P 획득! 😎</span>`;
        } else {
            points -= bet;
            resultMsg += `<span style="color:#ef5350;">-${bet}P 탕진! 😱</span>`;
        }

        document.getElementById("currentPoints").innerText = points;
        document.getElementById("resultMessage").innerHTML = resultMsg;

        // 게임 끝나면 서버에 점수 업데이트!!
        savePointsToServer();

        isPlaying = false;
        document.getElementById("btnOdd").disabled = false;
        document.getElementById("btnEven").disabled = false;

        if (points <= 0) {
            setTimeout(() => alert("파산했습니다! 새로운 계정으로 다시 시작하세요."), 100);
        }
    }, 1500);
}