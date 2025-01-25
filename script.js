let countries = [];
let currentQuestion = 0;
let score = 0;
let newPlayer = "";
let players = JSON.parse(localStorage.getItem("players")) || {};
let timer;
let timeLeft = 15;

// O'yinni boshlash
function startGame() {
  newPlayer = document.getElementById("newPlayer").value.trim();
  if (!newPlayer) {
    document.querySelector('.error').style.display = 'block'
    setTimeout(() => {
      document.querySelector('.error').style.display = 'none'
    }, 2000);
    return;
  }

  // localStorage.setItem('players', JSON.stringify({newPlayer: 0}));
  document.getElementById("intro").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("username").textContent = newPlayer;

  getCountries();
}
document.getElementById("start-btn").addEventListener("click", startGame);

// Davlatlar ro'yxatini olish

function getCountries() {
  axios.get("https://restcountries.com/v3.1/all").then((response) => {
    countries = response.data.slice(0, 10);
    displayQuestion();
  });
}
// Savollarni ko'rsatish
function displayQuestion() {
  if (currentQuestion >= 10) {
    endGame();
    return;
  }

  currentQuestion++;
  // 10 ta davlatdan tasodifiy bir davlatni tanlab olish
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  // To'g'ri poytaxtni tanlab olish
  const correctCapital = randomCountry.capital[0]
    ? randomCountry.capital[0]
    : "No answer";
  const answers = [correctCapital];

  while (answers.length < 4) {
    // Random javoblarni tanlab olish
    const randomAnswer =
      countries[Math.floor(Math.random() * countries.length)].capital[0] ||
      "No answer";
    if (!answers.includes(randomAnswer)) answers.push(randomAnswer);
  }

  shuffleArray(answers);
  document.getElementById("currentQuestion").textContent = `10 dan ${currentQuestion}-savol`;
  document.getElementById("score").textContent = `Ball: ${score}`;

  document.getElementById("flag").src = randomCountry.flags.png;
  document.getElementById("countryName").textContent =
  randomCountry.name.official;
  document.getElementById("answers").innerHTML = "";
  answers.forEach((option) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option;
    button.addEventListener("click", () => {
      checkAnswer(button, correctCapital);
    });
    document.getElementById("answers").appendChild(button);
  });

  resetTimer(correctCapital);
}

// Timerni boshidan boshlash
function resetTimer(correctAnswer) {
  clearInterval(timer);
  timeLeft = 15;
  document.getElementById("timer").textContent = `${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `${timeLeft}s`;
    if (timeLeft === 0) {
      clearInterval(timer);
      document.querySelectorAll(".answer-btn").forEach((btn) => {
        if (btn.textContent === correctAnswer) {
          btn.classList.add("correct");
        }
        setTimeout(displayQuestion, 2000);
      });
    }
  }, 1000);
}

// Foydalanuvchi tomonidan kiritilgan javobni to'g'riligini tekshirish
function checkAnswer(button, correctAnswer) {
  clearInterval(timer);
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach((btn) => btn.classList.add("disabled"));

  if (button.textContent === correctAnswer) {
    button.classList.add("correct");
    button.classList.remove("disabled");
    score++;
  } else {
    button.classList.add("wrong");
    button.classList.remove("disabled");
    buttons.forEach((btn) => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct");
      }
    });
  }

  setTimeout(displayQuestion, 2000);
}

// O'yinni tugatish
function endGame() {
  clearInterval(timer);
  document.getElementById("game").style.display = "none";
  document.getElementById("results").style.display = "block";

  if (!players) {
    players[newPlayer] = score;
    localStorage.setItem("players", JSON.stringify(players));
  }

  if (!Object.keys(players).includes(newPlayer)) {
    players[newPlayer] = score;
    localStorage.setItem("players", JSON.stringify(players));
  }

  if (score > players[newPlayer]) {
    players[newPlayer] = score;
    localStorage.setItem("players", JSON.stringify(players));
  }

  let message;
  if (score >= 8) {
    message = "Siz daxosiz!";
  } else if (score >= 5) {
    message = "Juda ajoyib, keyingi safar bundan ham zo'r bo'ladi";
  } else {
    message = "Afsus keyingi safar yaxshiroq harakat qiling!";
  }

  document.getElementById(
    "finalMessage"
  ).textContent = `${newPlayer}, siz 10ta savoldan ${score}ta sizga javob berdingiz.\n ${message}`;
}

// O'yinni boshidan boshlash
function resetGame() {
  score = 0;
  currentQuestion = 0;
  document.getElementById("results").style.display = "none";
  document.getElementById("game").style.display = "block";
  displayQuestion();
}
document.getElementById("reset").addEventListener("click", resetGame);

// O'yindan chiqish
function exitGame() {
  document.getElementById("intro").style.display = "flex";
  document.getElementById("game").style.display = "none";
  document.getElementById("results").style.display = "none";
  countries = [];
  currentQuestion = 0;
  score = 0;
  newPlayer = "";
  timer;
  timeLeft = 15;
}
document.getElementById("exit").addEventListener("click", exitGame);

// Faollar jadvalini ko'rsatish va o'chirish
function showLeaderboard() {
  const leaderboard = document.getElementById("leaderboard");
  const leaderboardLists = document.getElementById("leaderboardLists");
  const results = document.getElementById("results");
  leaderboard.style.display = "block";
  results.style.display = "none";
  leaderboardLists.innerHTML = "";

  // Local storagedan kelayotgan objectni arrayga o'tkazish va ekranga chiqarish
  Object.entries(players).map((player) => {
    leaderboardLists.innerHTML += `
    <div id="leaderboardList" class="leaderboardList">${player[0]}: ${player[1]} ball</div>
    `;
  });
}
document.getElementById("showLeaderboard").addEventListener("click", showLeaderboard);

function hideLeaderboard() {
  document.getElementById("leaderboard").style.display = "none";
  const results = document.getElementById("results");
  results.style.display = "block";
}
document.getElementById("hideLeaderboard").addEventListener("click", hideLeaderboard);

// Arraydagi savollarni aralashtirish
function shuffleArray(array) {
  for (let i = 0; i < array.length - 1; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
