// game.js

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const paddleWidth = 120; // Increased the width of the paddle
const paddleHeight = 15;
const ballRadius = 10;
const androidInterfaceExists = typeof AndroidInterface !== 'undefined';

let paddleX;
let rightPressed = false;
let leftPressed = false;
let ballX, ballY;
let ballDX = 4; // Increased the initial speed of the ball
let ballDY = -4;
let brickRowCount = 15;
let brickColumnCount;
let brickWidth;
let brickHeight = 25;
let brickPadding = 1;
let brickOffsetTop = 30;
let brickOffsetLeft = 10;
let score = 0;
let bricks = [];
let gameOver = true;
let marginBottom = 40; // Added space between paddle and bottom of the canvas

// Set a fixed width for each brick
const fixedBrickWidth = 75; // Adjust this value as needed

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Calculate the number of brick columns based on screen width
    brickColumnCount = Math.floor((canvas.width - brickOffsetLeft * 2 + brickPadding) / (fixedBrickWidth + brickPadding));

    // Calculate the actual width of each brick, considering padding
    brickWidth = (canvas.width - brickOffsetLeft * 2 - brickPadding * (brickColumnCount - 1)) / brickColumnCount;

    paddleX = (canvas.width - paddleWidth) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - paddleHeight - marginBottom - ballRadius; // Add spacing above the paddle

    // Initialize the bricks array with random colors
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: getRandomColor() }; // Assign random color to each brick
        }
    }
}

// Function to reset the game
function resetGame() {
    gameOver = false;
    score = 0;
    ballDX = 4
    ballDY = 4
    setup(); // Reinitialize game parameters
    draw(); // Start the game loop
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        // Optionally add some additional decorative elements
        // Set font and fill style for the subtext
        context.font = "24px Arial";
        context.fillStyle = "#FFFFFF"; // White color for the subtext
        context.textAlign = "center"; // Center text horizontally
        context.fillText("Tap to begin!", canvas.width / 2, canvas.height / 2 + 60); // Centered horizontally
        // Subtext
        context.font = "24px Arial";
        context.fillStyle = "#FFFFFF"; // White color for the subtext
        context.fillText("Score:"+score, canvas.width / 2, canvas.height / 2 + 120); // Centered horizontally

        if(androidInterfaceExists){        
            AndroidInterface.onGameOver();
        }
        return; // Stop the draw loop if game is over
    }

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();


    collisionDetection(); // Check collisions

    // Ball movement
    ballX += ballDX;
    ballY += ballDY;

    // Ball and wall collision detection
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX;
    }
    if (ballY + ballDY < ballRadius) {
        ballDY = -ballDY;
    } else if (ballY + ballDY > canvas.height - paddleHeight - marginBottom - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            // Ball reflects at different angles based on where it hits the paddle
            let paddleCenter = paddleX + paddleWidth / 2;
            let hitPoint = ballX - paddleCenter;
            ballDX = hitPoint * 0.1;  // Adjusts speed based on hit position
            ballDY = -ballDY;
            ballDX *= 1.09; // Slightly increase ball speed after hitting paddle
            ballDY *= 1.09;
        } else {
            gameOver = true;
        }
    }

    // Paddle movement
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    requestAnimationFrame(draw);
}

// Collision detection for bricks
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let brick = bricks[c][r];
            if (brick.status === 1) {
                if (
                    ballX > brick.x &&
                    ballX < brick.x + brickWidth &&
                    ballY > brick.y &&
                    ballY < brick.y + brickHeight
                ) {
                    ballDY = -ballDY;
                    brick.status = 0;
                    score++;
                }
            }
        }
    }
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                context.beginPath();
                context.rect(brickX, brickY, brickWidth, brickHeight);
                context.fillStyle = bricks[c][r].color;
                context.fill();
                context.closePath();
            }
        }
    }
}

function drawBall() {
    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = "#FFFFFF";
    context.fill();
    context.closePath();
}

function drawPaddle() {
    context.beginPath();
    context.rect(paddleX, canvas.height - paddleHeight - marginBottom, paddleWidth, paddleHeight);
    context.fillStyle = "#FFFFFF";
    context.fill();
    context.closePath();
}

function drawScore() {
    context.font = "16px Arial";
    context.fillStyle = "#0095DD";
    context.fillText("Score: " + score, 8, 20);
}

        // Handle touch events
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);

        function handleTouchStart(e) {
            e.preventDefault(); // Prevent screen from scrolling
            const touchX = e.touches[0].clientX; // Get the touch position

            if(gameOver){
                gameOver = false
                resetGame()
                return
            }
            // Move the paddle based on touch position
            if (touchX < canvas.width / 2) {
                paddleX -= 50; // Move left
            } else {
                paddleX += 50; // Move right
            }

            // Keep paddle within canvas bounds
            paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, paddleX));
        }

        function handleTouchMove(e) {
            e.preventDefault(); // Prevent screen from scrolling
            const touchX = e.touches[0].clientX; // Get the touch position

            // Move the paddle based on touch position
            if (touchX < canvas.width / 2) {
                paddleX -= 5; // Move left
            } else {
                paddleX += 5; // Move right
            }

            // Keep paddle within canvas bounds
            paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, paddleX));
        }

        function handleTouchEnd(e) {
            e.preventDefault(); // Prevent screen from scrolling
            // Optionally, you could reset the paddle position or do nothing
        }// Start the game
setup();
draw();
