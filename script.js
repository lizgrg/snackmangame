let isUpPressed = false;
let isDownPressed = false;
let isLeftPressed = false;
let isRightPressed = false;

const mazeContainer = document.querySelector('main');
const livesDisplay = document.querySelector('.lives ul');
const scoreDisplay = document.querySelector('.score p');
const startScreen = document.querySelector('.startDiv');
const startGameButton = startScreen.querySelector('.start');

let movePlayerInterval;
let moveEnemiesInterval;

startGameButton.addEventListener('click', () => {
    startScreen.style.display = 'none'; 
    startGame(); 
});

let livesRemaining = 3; 
let currentScore = 0; 
let totalPointsCount = 51; 

// Player = 2, Wall = 1, Enemy = 3, Point = 0
let gameMaze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 1, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 3, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Player's initial position
let playerPosition = { x: 1, y: 1 };

function startGame() {
    constructMaze();
    setInterval(movePlayer, 150); 
    setInterval(moveEnemies, 1000); 
    document.addEventListener('keydown', KeyDown);
    document.addEventListener('keyup', KeyUp);
}

function constructMaze() {
    mazeContainer.innerHTML = ''; 
    
    for (let row = 0; row < gameMaze.length; row++) {
        for (let col = 0; col < gameMaze[row].length; col++) {
            let cell = document.createElement('div');
            cell.classList.add('block');
            cell.dataset.x = col;
            cell.dataset.y = row;

            switch (gameMaze[row][col]) {
                case 1:
                    cell.classList.add('wall');
                    break;
                case 2:
                    cell.id = 'player';
                    let playerMouth = document.createElement('div');
                    playerMouth.classList.add('mouth');
                    
                    // Add direction classes based on movement
                    if (isUpPressed) {
                        playerMouth.classList.add('open', 'up');
                    } else if (isDownPressed) {
                        playerMouth.classList.add('open', 'down');
                    } else if (isLeftPressed) {
                        playerMouth.classList.add('open', 'left');
                    } else if (isRightPressed) {
                        playerMouth.classList.add('open', 'right');
                    }
                    
                    cell.appendChild(playerMouth);
                    break;
                case 3:
                    cell.classList.add('enemy');
                    break;
                case 0:
                    cell.classList.add('point');
                    cell.style.height = '1vh';
                    cell.style.width = '1vh';
                    break;
                case -1:
                    cell.classList.add('empty'); 
                    break;
            }

            mazeContainer.appendChild(cell);
        }
    }
}




function getPoint(position) {
    if (gameMaze[position.y][position.x] === 0) {
        gameMaze[playerPosition.y][playerPosition.x] = -1; 
        playerPosition = position; 
        gameMaze[position.y][position.x] = 2; // Move player to the new position

        updateScore(); // Increment the score
        totalPointsCount--;

        console.log('Point collected at:', position, 'Remaining points:', totalPointsCount);

        if (totalPointsCount === 0) {
            finishGame(); // End game if all points are collected
        }

        constructMaze(); 
    }
}

// Function to move player
function movePlayer() {
    let newPosition = { ...playerPosition };
    let isMoving = false;

    if (isDownPressed) {
        newPosition.y++;
        isMoving = true;
    } else if (isUpPressed) {
        newPosition.y--;
        isMoving = true;
    } else if (isLeftPressed) {
        newPosition.x--;
        isMoving = true;
    } else if (isRightPressed) {
        newPosition.x++;
        isMoving = true;
    }

    if (newPosition.y >= 0 && newPosition.y < gameMaze.length && newPosition.x >= 0 && newPosition.x < gameMaze[newPosition.y].length) {
        if (gameMaze[newPosition.y][newPosition.x] !== 1) {
            if (gameMaze[newPosition.y][newPosition.x] === 3) {
                handleLifeLoss(); 
                return;
            }

            if (gameMaze[newPosition.y][newPosition.x] === 0) {
                getPoint(newPosition);
                return; // Handle point collection
            }

            gameMaze[playerPosition.y][playerPosition.x] = -1; // Mark old position as permanently empty
            playerPosition = newPosition;
            gameMaze[playerPosition.y][playerPosition.x] = 2; // Mark new position as player
            constructMaze(); 
        }
    }
}

// move enemies
function moveEnemies() {
    if(livesRemaining === 0){
        return;
    }

    let enemyMoves = [];

    for (let row = 0; row < gameMaze.length; row++) {
        for (let col = 0; col < gameMaze[row].length; col++) {
            if (gameMaze[row][col] === 3) {
                let directions = [
                    { x: 0, y: 1 },   
                    { x: 0, y: -1 },  
                    { x: 1, y: 0 },   
                    { x: -1, y: 0 }   
                ];

                directions.sort(() => Math.random() - 0.5); 

                for (let direction of directions) {
                    let newCol = col + direction.x;
                    let newRow = row + direction.y;

                    if (newRow >= 0 && newRow < gameMaze.length && newCol >= 0 && newCol < gameMaze[newRow].length && gameMaze[newRow][newCol] === 0) {
                        enemyMoves.push({ fromX: col, fromY: row, toX: newCol, toY: newRow });
                        break;
                    }
                }
            }
        }
    }

    for (let move of enemyMoves) {
        gameMaze[move.fromY][move.fromX] = 0; 
        gameMaze[move.toY][move.toX] = 3; 
    }

    constructMaze(); 
}

// Function to update the score
function updateScore() {
    currentScore += 1; // Increase score by 1
    scoreDisplay.textContent = currentScore; 
}


function handleLifeLoss() {
    livesRemaining--;
    console.log('Lives left:', livesRemaining);

    // Update the lives display
    const livesList = livesDisplay;
    if (livesList.lastElementChild) {
        livesList.removeChild(livesList.lastElementChild); // Remove one life icon
    }

    flashPlayer(); 
    stopPlayerMovement(); // Disable player movement for 1.5 seconds

    if (livesRemaining === 0) {
        finishGame(); // End the game if no lives remain
    }
}

//End the game and display "Game Over" message
window.onload = function() {
    document.getElementById('restart-button').style.display = 'none';
};

function restartGame() {
    // Reset game state
    livesRemaining = 3;
    currentScore = 0;
    playerPosition = { x: 1, y: 1 };
    totalPointsCount = 50;
    gameMaze = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 1, 0, 0, 0, 0, 3, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        [1, 0, 0, 1, 0, 3, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 3, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    // Update displays
    livesDisplay.innerHTML = '<li></li><li></li><li></li>'; // Reset lives display
    scoreDisplay.textContent = currentScore;

    // Hide the restart button
    document.getElementById('restart-button').style.display = 'none';
    document.getElementById('game-over-message').style.display = 'none';

    constructMaze();

    // Re-add event listeners
    document.addEventListener('keydown', KeyDown);
    document.addEventListener('keyup', KeyUp);

    // Move enemies every second
}

let leaderboard = [];

function finishGame() {
    const playerName = prompt("Game Over! Enter your name:");

    // Add the player's score to the leaderboard
    if (playerName) {
        leaderboard.push({ name: playerName, score: currentScore });
        leaderboard.sort((a, b) => b.score - a.score); // Sort by score, descending
        if (leaderboard.length > 5) {
            leaderboard.pop(); 
        }
        updateLeaderboard();
    }

    document.getElementById('restart-button').style.display = 'block';
    document.getElementById('game-over-message').style.display = 'block';

    // Stop the game loop
    clearInterval(movePlayerInterval); 
    clearInterval(moveEnemiesInterval);

    document.removeEventListener('keydown', KeyDown);
    document.removeEventListener('keyup', KeyUp);
}

// Function to update the leaderboard display
function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = ''; // Clear current leaderboard

    leaderboard.forEach((entry) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.name}........${entry.score}`;
        leaderboardList.appendChild(listItem);
    });
}


function stopPlayerMovement() {
    isUpPressed = false;
    isDownPressed = false;
    isLeftPressed = false;
    isRightPressed = false;
    
    document.removeEventListener('keydown', KeyDown);
    document.removeEventListener('keyup', KeyUp);

    setTimeout(() => {
        if (livesRemaining > 0)
        document.addEventListener('keydown', KeyDown);
        document.addEventListener('keyup', KeyUp);
    }, 1500); // Disable input for 1.5 seconds
}

// hit animation
function flashPlayer() {
    const playerCell = document.getElementById('player');
    if (playerCell)
    playerCell.classList.add('hit');
    
    setTimeout(() => {
        playerCell.classList.remove('hit');
    }, 1500); 
  }// End game if no lives remain
   

// Key press event handlers
function KeyUp(event) {
    switch (event.key) {
        case 'ArrowUp':
            isUpPressed = false;
            break;
        case 'ArrowDown':
            isDownPressed = false;
            break;
        case 'ArrowLeft':
            isLeftPressed = false;
            break;
        case 'ArrowRight':
            isRightPressed = false;
            break;
    }
}

function KeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            isUpPressed = true;
            event.preventDefault();
            break;
        case 'ArrowDown':
            isDownPressed = true;
            event.preventDefault()
            break;
        case 'ArrowLeft':
            isLeftPressed = true;
            event.preventDefault()
            break;
        case 'ArrowRight':
            isRightPressed = true;
            event.preventDefault()
            break;
    }
}

// Initial maze rendering
    constructMaze();

const leftButton = document.getElementById('lbttn');
const upButton = document.getElementById('ubttn');
const rightButton = document.getElementById('rbttn');
const downButton = document.getElementById('dbttn');

leftButton.addEventListener('click', () => moveInDirection('left'));
upButton.addEventListener('click', () => moveInDirection('up'));
rightButton.addEventListener('click', () => moveInDirection('right'));
downButton.addEventListener('click', () => moveInDirection('down'));

function moveInDirection(direction) {
    isUpPressed = false;
    isDownPressed = false;
    isLeftPressed = false;
    isRightPressed = false;

    switch (direction) {
        case 'left':
            isLeftPressed = true;
            break;
        case 'up':
            isUpPressed = true;
            break;
        case 'right':
            isRightPressed = true;
            break;
        case 'down':
            isDownPressed = true;
            break;
    }
    movePlayer();

    // Reset flag to prevent repeated movement
    isLeftPressed = false;
    isUpPressed = false;
    isRightPressed = false;
    isDownPressed = false;

}

