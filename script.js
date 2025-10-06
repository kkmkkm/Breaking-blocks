// キャンバス要素と2D描画コンテキストを取得
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// DOM要素の取得
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const pauseMessage = document.getElementById("pauseMessage");

// --- ゲーム状態変数 ---
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 10;
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
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
let animationFrameId; // requestAnimationFrameのIDを保持
let gamePaused = false; // ★一時停止状態を管理するフラグ

// ブロックの初期化
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// --- イベントリスナー ---

// キーボード入力
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
// マウス入力
document.addEventListener("mousemove", mouseMoveHandler, false);

// ボタンクリックイベント
pauseButton.addEventListener("click", pauseGame);
resumeButton.addEventListener("click", resumeGame);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    if (gamePaused) return; // ★一時停止中はパドルを動かさない
    
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
        // requestAnimationFrameを停止する
        cancelAnimationFrame(animationFrameId); 
        
        // ボタンとメッセージの表示切り替え
        pauseButton.classList.add('hidden');
        resumeButton.classList.remove('hidden');
        pauseMessage.classList.remove('hidden');
    }
}

function resumeGame() {
    if (gamePaused) {
        gamePaused = false;
        
        // ボタンとメッセージの表示切り替え
        pauseButton.classList.remove('hidden');
        resumeButton.classList.add('hidden');
        pauseMessage.classList.add('hidden');
        
        // ゲームループを再開する
        draw(); 
    }
}

// --- ゲームロジックと描画関数 (変更なし) ---

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
            if (bricks[c][r].status === 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
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
    if (gamePaused) return; // ★一時停止中は処理を終了

    // 1. 前のフレームをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 各要素を描画
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    
    // 3. 当たり判定のチェック
    collisionDetection();

    // ボールの壁との当たり判定
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        // パドルとの当たり判定
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            y = canvas.height - ballRadius - paddleHeight;
        } else {
            // ゲームオーバー
            alert("GAME OVER");
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

// ゲーム開始
animationFrameId = requestAnimationFrame(draw);
