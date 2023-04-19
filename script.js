// script.js
// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-analytics.js";
import { getDatabase, ref, update, get, push } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

// Configure Firebase
const firebaseConfig = {
  apiKey: "AIzaSyALqGwEoRE5KUPZx2EHopUdrqspGz281VU",
  authDomain: "name-line.firebaseapp.com",
  databaseURL: "https://name-line-default-rtdb.firebaseio.com",
  projectId: "name-line",
  storageBucket: "name-line.appspot.com",
  messagingSenderId: "993693428714",
  appId: "1:993693428714:web:9c859f9af6fac6f4b66093",
  measurementId: "G-XLLXBBFDSE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Reference to questions in the database
const questionsRef = ref(database, 'questions');
const scoresRef = ref(database, 'scores');



// Set up variables
var startButton = document.getElementById('start-game-btn');
var questionContainer = document.getElementById('question-container');
var gameContainer = document.getElementById('game-container');
var questionEl = document.getElementById('question');
var choiceContainer = document.getElementById("choices-container");
var resultEl = document.getElementById("result");
var scoreEl = document.getElementById('score');
var timerEl = document.getElementById('timer');

var currentQuestionIndex;
var score = 0;
var timerIntervalId;
var questions;
var currentQuestion;
var originalQuestions;

// Set up event listener for start button
document.addEventListener("DOMContentLoaded", function () {
  startButton.addEventListener("click", startGame);
});

// Function to shuffle an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to start the game
function startGame() {
  // Hide the start button 
    document.getElementById('start-game-btn').classList.add('hide');
    
  
  
  // Show the question container
  questionContainer.classList.remove('hide');
  gameContainer.classList.remove('hide');
  timerEl.classList.remove('hide');
  scoreEl.classList.remove('hide');

  // Initialize variables
  currentQuestionIndex = 0;
  score = 0;

  // Display the first question
  displayQuestion();

  // Start the countdown timer
  startCountdownTimer();
}

// Function to display the question
function displayQuestion() {
  
  // Get the current question from the database randomly
  get(questionsRef).then(function (snapshot) {
    if (!originalQuestions) {
      originalQuestions = snapshot.val();
    }

    if (questions && questions.length === 0) {
      questions = [...originalQuestions];
      shuffle(questions);
    } else if (!questions) {
      questions = snapshot.val();
      shuffle(questions);
    }
      
      if (questions.length === 0) {
        endGame();
        return;
      }
      
      // Remove and get the current question from the shuffled array
      currentQuestion = questions.pop();

        
    // Display the question
    questionEl.textContent = currentQuestion.question;
    

    // Remove existing answer buttons
    while (choiceContainer.firstChild) {
      choiceContainer.removeChild(choiceContainer.firstChild);
    }

    // Display the answer buttons
    currentQuestion.choices.forEach(function (choice, index) {
      var button = document.createElement("button");
      button.textContent = choice;
      button.classList.add("choice-btn");
      button.dataset.answer = index;
      button.addEventListener("click", function () {
        checkAnswer(currentQuestion.answer, parseInt(button.dataset.answer));
      });
      choiceContainer.appendChild(button);
    });
});
}


// Function to start the countdown timer
function startCountdownTimer() {
  // Set the timer to 60 seconds
  var time = 60;

  // Display the initial timer value
  timerEl.textContent = time;

// Start the countdown
timerIntervalId = setInterval(function() {
  // Decrement the timer
  time--;

  // Display the updated timer value
  timerEl.textContent = time;

  // Check if the time has run out
  if (time <= 0) {
    // Stop the timer
    clearInterval(timerIntervalId);

    // End the game
    endGame();
  }
}, 1000);
}

// Function to check if the user's answer is correct
function checkAnswer(correctAnswer, userAnswer) {
  
  // Check if the answer is correct
  if (correctAnswer == userAnswer) {

    //Display to user that the answer is correct
    resultEl.classList.remove('hide');
    resultEl.textContent = 'Correct!';
    
    //Hide the result after 2 second
    setTimeout(function(){
      resultEl.classList.add('hide');
    }, 2000);
    
    // Add 2 point to the score
    score += 2;
    
  } else { 
    resultEl.classList.remove('hide');
    resultEl.textContent = 'Incorrect! The correct answer is ' + currentQuestion.choices[correctAnswer];

    //Hide the result after 2 second
    setTimeout(function(){
      resultEl.classList.add('hide');
    }, 4000);
    
  } 
  // Update the score
    scoreEl.textContent = score;
    
// Display the next question
if (questions.length > 0) {
  displayQuestion();
} else {
  // End the game
  endGame();
}
}

// Function to fetch leaderboard data
async function fetchLeaderboardData() {
  const snapshot = await get(scoresRef);
  return snapshot.val();
}

// Function to update leaderboard with new score
async function updateLeaderboard(newScore) {
  const newScoreKey = (await push(scoresRef)).key;
  const updates = {};
  updates[newScoreKey] = newScore;
  await update(scoresRef, updates);
}


// Function to end the game
async function endGame() {
// Stop the timer
clearInterval(timerIntervalId);

// Fetch leaderboard data
const leaderboardData = await fetchLeaderboardData();

// Sort leaderboard data by score in descending order
const sortedLeaderboardData = Object.values(leaderboardData).sort((a, b) => b.score - a.score);

// Check if the user's score is within the top 5
const isTopScore = sortedLeaderboardData.length < 5 || score > sortedLeaderboardData[4].score;

// Prompt user for their name if their score is within the top 5
if (isTopScore) {
  const playerName = prompt("You made it to the top 5! Please enter your name for the leaderboard:");

if (playerName) {
  const newScore = { name: playerName, score: score };
  updateLeaderboard(newScore)
    .then(() => {
      console.log("Leaderboard updated successfully");
    })
    .catch((error) => {
      console.error("Error updating leaderboard:", error);
    });
  }
} else {
  alert("Unfortunately, your score is not within the top 5.");
}

startButton.innerText = 'Restart';
startButton.classList.remove('hide');
questionContainer.classList.add('hide');
}
