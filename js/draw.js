const messageArea = document.querySelector('.pause-box p');
const scoreArea = document.querySelector('.score');
const recordArea = document.querySelector('.record');
const canvasWrap = document.querySelector('.canvas-wrap');
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const canvasSize = 800;
const step = 20;
const stepScore = 10;
const pointsPerLevel = 100;

let arrMap = createArrMap(40, 40);
let snakeBody = [{x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}];
let moveDirection = 'right';
let isPaused = true;
let isGrubed = true;
let gameIsOver = false;
let interval;
let userScore = 0;
let userRecord = Number(localStorage.getItem('record')) || 0;
let snakeSpeed = 120;

canvas.width = canvasSize;
canvas.height = canvasSize;

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && moveDirection !== 'down') {
      return moveDirection = 'up';
    }
    if (e.key === 'ArrowDown' && moveDirection !== 'up') {
      return moveDirection = 'down';
    }
    if (e.key === 'ArrowLeft' && moveDirection !== 'right') {
      return moveDirection = 'left';
    }
    if (e.key === 'ArrowRight' && moveDirection !== 'left') {
      return moveDirection = 'right';
    }
    if (e.key === 'Enter') {
      setRecord();
      return (messageArea.textContent = 'Press "Space" to start or continue Game') && restart();
    }
    if (e.code === 'Space') {
        if (!gameIsOver) {
          isPaused = !isPaused;
          pause();
        }
    }
});

initialDraw();

function createArrMap(width, height) {
  const arr = [];
  for (let i = 0; i < height; i++) {
    arr.push(Array(width).fill(0));
  }
  return arr;
}

function initialDraw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  ctx.fillStyle = '#777';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = '3';
  snakeBody.forEach(el => arrMap[el['y']][el['x']] = 1);
  setRecord();
  if (isGrubed) {
    createGrub();
  }
  drawSnake();
}

function drawSnake() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,800,800);
  
  for (let i = 0; i < arrMap.length; i++) {
    for (let j = 0; j < arrMap[0].length; j++) {
      if ((snakeBody[0].y === i && snakeBody[0].x === j)
        || (snakeBody[snakeBody.length - 1].y === i && snakeBody[snakeBody.length - 1].x === j)) 
      {
        drawSquare('#ff0000', i, j);
        continue;
      }
      if (arrMap[i][j] === 1) {
        drawSquare('#777', i, j);
      }
    }
  }
}

function drawSquare(color, i, j) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.rect(step * j, step * i, step, step);
  ctx.fill();
  ctx.stroke();
}

function checkBeforeMove() {
  const snakeHeadX = snakeBody[snakeBody.length - 1].x;
  const snakeHeadY = snakeBody[snakeBody.length - 1].y;
  
  if ( moveDirection === 'right') { 
    return (snakeHeadX + 1 >= 40 || isSelfDistruct(snakeHeadX + 1, snakeHeadY)) 
    ? snakeKill() : snakeMove(snakeHeadX + 1, snakeHeadY);
  }
  if (moveDirection === 'left') { 
    return (snakeHeadX - 1 < 0 || isSelfDistruct(snakeHeadX - 1, snakeHeadY)) 
    ? snakeKill() : snakeMove(snakeHeadX - 1, snakeHeadY);
  }
  if (moveDirection === 'down') {
    return (snakeHeadY + 1 >= 40 || isSelfDistruct(snakeHeadX, snakeHeadY + 1))
    ? snakeKill() : snakeMove(snakeHeadX, snakeHeadY + 1);
  }
  if (moveDirection === 'up') {
    return (snakeHeadY - 1 < 0 || isSelfDistruct(snakeHeadX, snakeHeadY - 1))
    ? snakeKill() : snakeMove(snakeHeadX, snakeHeadY - 1);
  }
}

function isSelfDistruct(x, y) {
  return snakeBody.filter(el => (el.y === y && el.x === x) && el).length ? true : false;
}

function snakeEat(x, y) {
  snakeBody.push({ x, y });
  setScore(stepScore);
  isGrubed = true;
  clearInterval(interval);
  (userScore % 100 === 0) && (snakeSpeed = snakeSpeed - 5);
  setMoveInterval();
  drawSnake();
}

function snakeIdling(x, y) {
  snakeBody.push({x, y});
  arrMap[y][x] = 1;
  arrMap[snakeBody[0].y][snakeBody[0].x] = 0;
  snakeBody.shift();
  drawSnake();
}

function snakeMove(x, y) {
  arrMap[y][x] === 1 ? snakeEat(x, y) : snakeIdling(x, y);
}

function snakeKill() {
  gameEventMsg(generateGameOverMsg());
  (gameIsOver = true) && clearInterval(interval); 
}

function createGrub() {
  const randX = Math.ceil(Math.random() * 39);
  const randY = Math.ceil(Math.random() * 39);
  if (snakeBody.filter(el => (el.y === randY && el.x === randX) && el).length) {
    createGrub();
    return;
  }
  arrMap[randY][randX] = 1;
  drawSnake();
  isGrubed = false;
}

function pause() {
  gameEventMsg('Press "Space" to start or continue Game');
  if (isPaused) {
    clearInterval(interval);
  }
  if (!isPaused && !gameIsOver) {
    setMoveInterval();
  }
}

function setMoveInterval() {
  interval = setInterval(() => {
    isGrubed && createGrub();
    checkBeforeMove();
  }, snakeSpeed);
}

function restart() {
  if (gameIsOver) {
    moveDirection = 'right';
    isPaused = true;
    snakeBody = [{x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}, {x: 8, y: 0}, {x: 9, y: 0}, {x: 10, y: 0}];
    arrMap = createArrMap(40, 40);
    gameIsOver = false;
    isGrubed = true;
    userScore = 0;
    snakeSpeed = 120;
    setScore(userScore);
    initialDraw();
  }
}

function setScore(val) {
  userScore += val;
  scoreArea.textContent = `${userScore}/${Math.floor(userScore/pointsPerLevel)}`;
}

function setRecord() {
  if (userScore > userRecord) {
    localStorage.setItem('record', userScore);
    userRecord = userScore;
  }
  recordArea.textContent = userRecord;
}

function gameEventMsg(msg) {
  canvasWrap.classList.toggle('paused');
  messageArea.textContent = msg;
}

function generateGameOverMsg() {
  return userScore > userRecord
  ? `Congrats, you broke the record with ${userScore} score . To restart game press "Enter"`
  : `You lose with ${userScore} points. To restart game press "Enter"`
}

//Test comment 