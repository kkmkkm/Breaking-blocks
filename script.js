// キャンバス要素と2D描画コンテキストを取得
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// DOM要素の取得
const startButton = document.getElementById("startButton");
const startScreen = document.getElementById("startScreen");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const pauseMessage = document.getElementById("pauseMessage");

// --- ゲーム状態変数 --- 
let x, y, dx, dy;
const ballRadius = 10;
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX;
const paddleSpeed = 7;
let rightPressed = false;
let leftPressed = false;
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
let score = 0;
let bricks = []; 
let animationFrameId;
let gamePaused = true; // ★初期状態は一時停止（スタート画面が表示される）

/**
 * ゲームの状態を初期化し、最初の静的描画を行う関数
 */
function initializeGame() {
    // ボールとパドルの初期位置設定
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;

    // ブロックの初期化と座標計算
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
            bricks[c][r] = { x: brickX, y: brickY, status: 1 };
        }
    }
    score = 0;
    
    // キャンバスをクリアし、初期状態を**静的**に描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall(); 
    drawScore();
}

// --- イベントリスナー ---

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

pauseButton.addEventListener("click", pauseGame);
resumeButton.addEventListener("click", resumeGame);
startButton.addEventListener("click", startGame);

/**
 * スタートボタンが押されたときの処理
 */
function startGame() {
    // スタート画面とボタンの切り替え
    startScreen.classList.add('hidden'); 
    pauseButton.classList.remove('hidden'); 

    // ゲームの初期化と最初の描画を実行
    initializeGame(); 
    
    // ゲームループを開始
    gamePaused = false; 
    draw(); 
}

function keyDownHandler(e) {
    if (gamePaused) return; 
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (gamePaused) return; 
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    if (gamePaused) return; 
    
    const relativeX = e.clientX - canvas.offsetLeft;
    
    if (relativeX > 0 && relativeX < canvas.width) {
        let targetX = relativeX - paddleWidth / 2;
        
        if (targetX < 0) {
            paddleX = 0;
        } else if (targetX > canvas.width - paddleWidth) {
            paddleX = canvas.width - paddleWidth;
        } else {
            paddleX = targetX;
        }
    }
}

// --- 暫停・再開ロジック ---

function pauseGame() {
    if (!gamePaused) {
        gamePaused = true;
        cancelAnimationFrame(animationFrameId); 
        
        pauseButton.classList.add('hidden');
        resumeButton.classList.remove('hidden');
        pauseMessage.classList.remove('hidden');
    }
}

function resumeGame() {
    if (gamePaused) {
        gamePaused = false;
        
        pauseButton.classList.remove('hidden');
        resumeButton.classList.add('hidden');
        pauseMessage.classList.add('hidden');
        
        draw(); 
    }
}

// --- ゲームロジックと描画関数 ---

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) { 
                if (
                    x > b.x && x < b.x + brickWidth &&
                    y > b.y && y < b.y + brickHeight
                ) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    
                    if (score === brickRowCount * brickColumnCount) {
                        alert("ゲームクリア、おめでとう！");
                        document.location.reload(); 
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                ctx.beginPath();
                ctx.rect(b.x, b.y, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

// メインの描画・更新ループ
function draw() {
    if (gamePaused) return;

    // 1. 前のフレームをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 各要素を描画
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    
    // 3. 当たり判定のチェック
    collisionDetection();

    // ボールと壁、パドルの当たり判定、位置更新
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            y = canvas.height - ballRadius - paddleHeight;
        } else {
            alert(`GAME OVER\n最終スコア: ${score}`);
            document.location.reload(); 
            return; 
        }
    }

    // パドルのキーボード移動
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSpeed;
    }

    // ボールの位置を更新
    x += dx;
    y += dy;

    // 次の描画フレームを要求
    animationFrameId = requestAnimationFrame(draw);
}

// 最初の起動時、ゲームは開始しない。
