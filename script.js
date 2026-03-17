// ==========================================
// 🔒 [A] 로그인 & 회원가입 로직
// ==========================================
let currentUserId = ""; 

// 화면 전환 함수들
function showSignupScreen() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("signupScreen").style.display = "block";
}

function showLoginScreen() {
    document.getElementById("signupScreen").style.display = "none";
    document.getElementById("loginScreen").style.display = "block";
}

// 회원가입 버튼 로직
function processSignup() {
    const idInput = document.getElementById("newId").value;
    const pwInput = document.getElementById("newPw").value;
    const pwConfirmInput = document.getElementById("newPwConfirm").value;

    if (!idInput) { alert("아이디를 입력해주세요!"); return; }
    if (!pwInput) { alert("비밀번호를 입력해주세요!"); return; }
    if (pwInput !== pwConfirmInput) { 
        alert("비밀번호가 서로 일치하지 않습니다!"); 
        return; 
    }

    alert(`환영합니다! [${idInput}]님, 가입이 완료되었습니다.\n이제 로그인해주세요.`);
    
    // 가입 완료 후 빈칸으로 초기화하고 로그인 화면으로 돌려보냄
    document.getElementById("newId").value = "";
    document.getElementById("newPw").value = "";
    document.getElementById("newPwConfirm").value = "";
    showLoginScreen();
}

// 로그인 버튼 로직
function processLogin() {
    const idInput = document.getElementById("userId").value;
    const pwInput = document.getElementById("userPw").value;

    if (!idInput) { alert("아이디를 입력해주세요!"); return; }
    if (!pwInput) { alert("비밀번호를 입력해주세요!"); return; }

    currentUserId = idInput;
    document.getElementById("displayUsername").innerText = currentUserId; 
    
    // 게임 화면으로 넘어가기
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainGameScreen").style.display = "flex";

    // 랭킹 보여주기
    renderRanking();
}

// ==========================================
// 🏆 [B] 랭킹 시스템 로직
// ==========================================
const dummyRankings = [
    { name: "마네킹 1", points: 15000 }, { name: "마네킹 2", points: 12500 },
    { name: "마네킹 3", points: 9800 },  { name: "마네킹 4", points: 8200 },
    { name: "마네킹 5", points: 5000 },  { name: "마네킹 6", points: 4500 },
    { name: "마네킹 7", points: 3000 },  { name: "마네킹 8", points: 1200 }
];

function renderRanking() {
    const topList = document.getElementById('topRankList');
    const extraList = document.getElementById('extraRankList');
    const toggleBtn = document.getElementById('toggleRankBtn');

    topList.innerHTML = ''; extraList.innerHTML = '';

    dummyRankings.forEach((user, index) => {
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

    if (dummyRankings.length <= 5) toggleBtn.style.display = 'none';
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
// 🎲 [C] 홀짝 게임 기본 로직
// ==========================================
let points = 1000;
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

        isPlaying = false;
        document.getElementById("btnOdd").disabled = false;
        document.getElementById("btnEven").disabled = false;

        if (points <= 0) {
            setTimeout(() => alert("파산했습니다! 새로고침(F5)을 눌러주세요."), 100);
        }
    }, 1500);
}