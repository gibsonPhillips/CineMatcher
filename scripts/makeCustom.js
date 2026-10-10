// enstantiate
const form = document.querySelector('form');
const movieInput = document.getElementById('custom-list-input');
const leaderboard = document.getElementById('leaderboard');
const startVotingBtn = document.querySelector('.btn-skip');
let itemArray = [];
let index = 0;


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const item = movieInput.value.trim();

    if (!item) return;

    try {
        itemArray.push(item);
        movieInput.value = '';
        updateList(item);
    } catch (error) {
        console.error("Error adding item: ", error);
    }
});


// blit list
function updateList(item) {
    const len = itemArray.length;
    // dunno if this one is really necissary yet, but keeping anyways. 
    if (len == 0) {
        resetBoard();
        return
    }
    // choosing this schema which will have edge cases to catch but will be more efficient. 
    else if (len == 1) {
        leaderboard.innerHTML = '';
    }

    const div = document.createElement('div');
    div.className = 'custom-item';
    div.textContent = item;

    div.onclick = function () {
        this.remove();
        removeItem(item);
    }
    div.id = index;
    index++;
    leaderboard.appendChild(div);
};

function removeItem(item) {
    const indexOf = itemArray.indexOf(item);
    itemArray.splice(indexOf, 1);
    // console.log(itemArray.length);
    if (itemArray.length < 1) { resetBoard() }
    return;
}

function resetBoard() {
    leaderboard.innerHTML = '<p style="color:#aaa; font-style:italic;">Add your own items to the list...</p>';
    itemArray = [];
    return
}

startVotingBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("here");
    sessionStorage.setItem("customList", itemArray);
    window.location.href = 'custom_vote.html';
});