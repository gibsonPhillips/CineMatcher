// enstantiate
const form = document.querySelector('form');
const movieInput = document.getElementById('custom-list-input');
const leaderboard = document.getElementById('leaderboard');
const startVotingBtn = document.querySelector('.btn-skip');
let itemArray = [];



form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const item = movieInput.value.trim();

    if (!item) return;

    try {
        await itemArray.push(item);
        movieInput.value = '';
        updateList(item);
    } catch (error) {
        console.error("Error adding item: ", error);
    }
});


// blit list
updateList(item) {
    const div = document.createElement('div');
    div.className = 'custom-item';
    div.textContent = movie.title;
    leaderboard.appendChild(div);
};



startVotingBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = './custom_list.html';
});
