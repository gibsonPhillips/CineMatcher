import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBgk6XggRe55xg6B873kIXusi58owD5aKw",
    authDomain: "cinematcherer.firebaseapp.com",
    databaseURL: "https://cinematcherer-default-rtdb.firebaseio.com",
    projectId: "cinematcherer",
    storageBucket: "cinematcherer.firebasestorage.app",
    messagingSenderId: "264853832519",
    appId: "1:264853832519:web:3a29257064126bf90b4262"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


let movies = [];
let currentIndex = 0;
let roomId = "";
let userId = "user_" + Math.random().toString(36).substr(2, 9); // persistent unique ID per device tab, maybe

const POINT_VALUES = { need: 3, could: 1, wont: -2, skip: 0};


// determine or send to room generator
function initRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    roomId = urlParams.get('room');

    if (!roomId) {
        roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
        window.history.replaceState({}, '', `?room=${roomId}`);
    }

    document.getElementById('roomLink').innerText = window.location.href;
    listenToLiveScores();
}


// generate room id
// also make id the seed for movie order
function seedShuffle(array, seed) {
    let m = array.length, t, i;
    let numericSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    while (m) {
        i = Math.floor((Math.abs(Math.sin(numericSeed++)) * 1000) % m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

async function loadMovies() {
    try {
        const response = await fetch('resources/movies.json');
        const data = await response.json();

        movies = seedShuffle(data, roomId);
        displayNextMovie();
    } catch (err) {
        console.error(err);
        document.getElementById('movieCard').innerHTML = "<p style='color:red;'>Failed to load movies.json framework.</p>";
    }
}

window.displayNextMovie = function () {
    if (currentIndex >= movies.length) {
        document.getElementById('movieCard').innerHTML = "<h3>End of Catalog!</h3><p>You have rated everything.</p>";
        return;
    }
    const movie = movies[currentIndex];
    document.getElementById('movieCard').innerHTML = `
    <a class="unstyled-link" href="https://www.movieofthenight.com/search?term=${movie.t}" target="_blank">
        <div class="movie-title">${movie.t}</div>
        <div class="movie-meta">${movie.y} • (${movie.g.toLocaleString()} votes)</div>
        </a>
      `;
}

window.skipVote = function (tier) {
    if (currentIndex >= movies.length) return;

    // uncomment if you want to actually submit a +0 score to the DB
    /*
    const movie = movies[currentIndex];

    // Automatically send individual votes up to the shared room reference
    set(ref(db, `rooms/${roomId}/votes/${userId}/${movie.i}`), tier);
    */
    currentIndex++;
    displayNextMovie();
}

window.submitVote = function (tier) {
    if (currentIndex >= movies.length) return;
    const movie = movies[currentIndex];

    set(ref(db, `rooms/${roomId}/votes/${userId}/${movie.i}`), tier);

    currentIndex++;
    displayNextMovie();
}


function listenToLiveScores() {
    const roomVotesRef = ref(db, `rooms/${roomId}/votes`);

    onValue(roomVotesRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        let aggregatedScores = {};

        for (const userKey in data) {
            const userVotes = data[userKey];
            for (const movieId in userVotes) {
                const tier = userVotes[movieId];
                if (!aggregatedScores[movieId]) {
                    aggregatedScores[movieId] = { score: 0, count: 0 };
                }
                aggregatedScores[movieId].score += POINT_VALUES[tier];
                aggregatedScores[movieId].count += 1;
            }
        }

        renderLeaderboard(aggregatedScores);
    });
}

function renderLeaderboard(scores) {
    const leaderboardDiv = document.getElementById('leaderboard');
    const sortedList = [];

    for (const [id, data] of Object.entries(scores)) {
        const movieMatch = movies.find(m => m.i === id);
        if (movieMatch) {
            sortedList.push({ title: movieMatch.t, year: movieMatch.y, score: data.score, count: data.count });
        }
    }

    sortedList.sort((a, b) => b.score - a.score);

    leaderboardDiv.innerHTML = sortedList.map(item => {
        let badgeClass = 'score-neutral';
        if (item.score > 0) badgeClass = 'score-positive';
        if (item.score < 0) badgeClass = 'score-negative';
        return `
          <div class="rank-item">
            <div>
              <strong>${item.title}</strong> <span style="font-size:12px; color:#aaa;">(${item.year})</span>
              <div style="font-size:11px; color:#888;">Ranked by ${item.count} player(s)</div>
            </div>
            <div class="LB-badges">
                <div class="info-badge-${badgeClass}"><a class="info-link-${badgeClass}" href="https://www.movieofthenight.com/search?term=${item.title}" target="_blank">Info</a></div>
                <div class="score-badge ${badgeClass}">${item.score > 0 ? '+' : ''}${item.score} pts</div>
            </div>
          </div>
        `;
    }).join('');
}

// init
initRoom();
loadMovies();