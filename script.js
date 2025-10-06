// キャンバス要素と2D描画コンテキストを取得
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// DOM要素の取得
const startButton = document.getElementById("startButton"); // 【追加】
const startScreen = document.getElementById("startScreen"); // 【追加】
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const pauseMessage = document.getElementById("pauseMessage");

// --- ゲーム状態変数 --- (初期値の設定のみ)
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
let bricks = []; // 初期化は startGame で行う
let animationFrameId;
let gamePaused = true; // ★初期状態は一時停止（スタート画面）

/**
 * ゲームの状態を初期化する関数
 */
function initializeGame() {
    // ボールとパドルの初期位置設定
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2;
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2;

    // ブロックの初期化
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
    score = 0;
    gamePaused = false; // ゲーム開始準備完了
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
startButton.addEventListener("click", startGame); // 【追加】

/**
 * スタートボタンが押されたときの処理
 */
function startGame() {
    startScreen.classList.add('hidden'); // スタート画面を非表示
    pauseButton.classList.remove('hidden'); // 一時停止ボタンを表示
    
    initializeGame(); // ゲームの状態を初期化
    draw(); // ゲームループを開始
}

// ... (keyDownHandler, keyUpHandler, mouseMoveHandler は変更なし)

function keyDownHandler(e) {
    if (gamePaused) return; // 一時停止中はキーボード操作無効
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (gamePaused) return; // 一時停止中はキーボード操作無効
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    if (gamePaused) return; // 一時停止中はパドルを動かさない
    
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


// --- 暫停・再開ロジック (startGame() を除き変更なし) ---

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

// ... (collisionDetection, drawBall, drawPaddle, drawBricks, drawScore は変更なし)

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
            // ゲームオーバー処理
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

// 【削除】ゲーム開始の自動実行を削除しました。
// ゲームはスタートボタンが押されるまで開始されません。
