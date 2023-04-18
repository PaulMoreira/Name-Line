// leaderboard.js
// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-analytics.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

// Configure Firebase
const firebaseConfig = {
  // Your Firebase configuration
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

// Reference to scores in the database
const scoresRef = ref(database, 'scores');

// Set up variables
const leaderboardBody = document.getElementById("leaderboard-body");
const backButton = document.getElementById("back-btn");

// Event listener for the back button
backButton.addEventListener("click", () => {
  window.location.href = "index.html";
});

// Function to fetch leaderboard data and display it
async function displayLeaderboardData() {
  const snapshot = await get(scoresRef);
  const scores = snapshot.val();
  const sortedScores = Object.values(scores).sort((a, b) => b.score - a.score);

  sortedScores.forEach((score, index) => {
    const row = document.createElement("tr");
    const rankCell = document.createElement("td");
    const nameCell = document.createElement("td");
    const scoreCell = document.createElement("td");

    rankCell.textContent = index + 1;
    nameCell.textContent = score.name;
    scoreCell.textContent = score.score;

    row.appendChild(rankCell);
    row.appendChild(nameCell);
    row.appendChild(scoreCell);

    leaderboardBody.appendChild(row);
  });
}

// Fetch and display leaderboard data
displayLeaderboardData();
