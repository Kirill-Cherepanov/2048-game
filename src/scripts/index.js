import GameBoard from './GameBoard.js';
import Swipe from './Swipe.js';

const gameboard = document.querySelector('.gameboard');
const grid = document.querySelector('.grid-container');
const tiles = Array.from(document.querySelectorAll('.tile'));
const retryButton = document.querySelector('.retry');
const currScore = document.querySelector('.calc-score');
const bestScore = document.querySelector('.best-score');

const game = new GameBoard(tiles, currScore, bestScore, function() {
    grid.style.backgroundColor = '#8A0707';
});
const swipe = new Swipe(gameboard, { minDistance: 50 });

const moveDelay =
    game.ANIMATION.movementduration + game.ANIMATION.scaleduration * 1.5 + 50;
let lastMoveTime = 0;

// Fetching best score from local storage
if (localStorage.getItem('2048-best-score') === null) {
    localStorage.setItem('2048-best-score', '0');
}
bestScore.innerText = localStorage.getItem('2048-best-score');

retryButton.addEventListener('click', () => {
    grid.style.backgroundColor = null;
    game.newGame();
});

// Swipe initialization
let afterEvent = swipe.addEventListener('after', (direction) => {
    if (Date.now() - lastMoveTime < moveDelay) return;
    lastMoveTime = Date.now();

    switch (direction) {
        case 'left':
            game.move([0, -1]);
            break;
        case 'right':
            game.move([0, 1]);
            break;
        case 'up':
            game.move([1, 0]);
            break;
        case 'down':
            game.move([-1, 0]);
            break;
    }
});
// Remove event with evt.clear();

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            if (Date.now() - lastMoveTime < moveDelay) return;
            lastMoveTime = Date.now();

            e.preventDefault();
            game.move([0, -1]);
            break;
        case 'ArrowRight':
            if (Date.now() - lastMoveTime < moveDelay) return;
            lastMoveTime = Date.now();

            e.preventDefault();
            game.move([0, 1]);
            break;
        case 'ArrowUp':
            if (Date.now() - lastMoveTime < moveDelay) return;
            lastMoveTime = Date.now();

            e.preventDefault();
            game.move([1, 0]);
            break;
        case 'ArrowDown':
            if (Date.now() - lastMoveTime < moveDelay) return;
            lastMoveTime = Date.now();

            e.preventDefault();
            game.move([-1, 0]);
            break;
    }
});

game.newGame();
