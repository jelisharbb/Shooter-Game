const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d");
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

const backgroundSky = new Image();
backgroundSky.src = "images/sky.jpg";

let score = 0;
let gameOver = false;

let timeToNextRaven = 0;
let ravenInterval = 900;
let lastTime = 0;

let ravens = [];
class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.4 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 1 + 1;
    this.directionY = Math.random() * 3 - 1.5;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = "images/raven.png";
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 50;
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
    this.hasTrail = Math.random() > 0.5;
  }
  update(deltaTime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }

    if (score >= 0 && score < 11) {
      this.x -= this.directionX; // level 1, scores 0 to 10
      this.y -= this.directionY;
      ravenInterval = 900;
    }

    if (score > 10 && score < 21) {
      this.x -= this.directionX + 0.0001; // level 2, scores 11 to 20
      this.y -= this.directionY + 0.0001;
      ravenInterval = 800;
    }
    if (score > 20 || score == 31) {
      this.x -= this.directionX + 0.0005; // level 3, scores 21 to 30
      this.y -= this.directionY + 0.0005;
      ravenInterval = 700;
    }
    if (score > 30 || score == 41) {
      this.x -= this.directionX + 0.001; // level 4, scores 31 to 40
      this.y -= this.directionY + 0.001;
      ravenInterval = 600;
    }
    if (score > 40) {
      this.x -= this.directionX + 0.005; // level 5, scores 41 and above
      this.y -= this.directionY + 0.003;
      ravenInterval = 500;
    }

    if (this.x < 0 - this.width) this.markedForDeletion = true;
    this.timeSinceFlap += deltaTime;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
      if (this.hasTrail) {
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle(this.x, this.y, this.width, this.color));
        }
      }
    }
    if (this.x < 0 - this.width) gameOver = true;
  }
  draw() {
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let explosions = [];
class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src = "images/boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "audios/boom.wav";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltaTime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y - this.size / 4,
      this.size,
      this.size
    );
  }
}

let particles = [];
class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size / 2;
    this.y = y + this.size / 3;
    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 20 + 35;
    this.markedForDeletion = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.radius += 0.3;
    if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawScore() {
  ctx.font = "35px Impact";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 35, 65);
  ctx.fillStyle = "#f28a0f";
  ctx.fillText("Score: " + score, 30, 60);
}

function drawLevel() {
  ctx.font = "35px Impact";

  if (score >= 0 && score <= 10) {
    ctx.fillStyle = "black";
    ctx.fillText("Level: 1", 35, 105);
    ctx.fillStyle = "white";
    ctx.fillText("Level: 1", 30, 100);
  } else if (score >= 11 && score <= 20) {
    ctx.fillStyle = "black";
    ctx.fillText("Level: 2", 35, 105);
    ctx.fillStyle = "white";
    ctx.fillText("Level: 2", 30, 100);
  } else if (score >= 21 && score <= 30) {
    ctx.fillStyle = "black";
    ctx.fillText("Level: 3", 35, 105);
    ctx.fillStyle = "white";
    ctx.fillText("Level: 3", 30, 100);
  } else if (score >= 31 && score <= 40) {
    ctx.fillStyle = "black";
    ctx.fillText("Level: 4", 35, 105);
    ctx.fillStyle = "white";
    ctx.fillText("Level: 4", 30, 100);
  } else {
    ctx.fillStyle = "black";
    ctx.fillText("Level: 5", 35, 105);
    ctx.fillStyle = "white";
    ctx.fillText("Level: 5", 30, 100);
  }
}

function drawGameOver() {
  ctx.font = "70px Impact";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgb(254, 92, 92)";
  ctx.fillText("GAME OVER", canvas.width / 2 - 5, canvas.height / 2 - 5);

  ctx.font = "50px Impact";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 60);
  ctx.textAlign = "center";
  ctx.fillStyle = "#68bb59";
  ctx.fillText(
    "Score: " + score,
    canvas.width / 2 - 5,
    canvas.height / 2 - 5 + 60
  );

  const gameOverSound = new Audio();
  gameOverSound.src = "audios/gameover.wav";
  gameOverSound.play();
}

window.addEventListener("click", function (e) {
  const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
  console.log(detectPixelColor);
  const pc = detectPixelColor.data;
  ravens.forEach((object) => {
    if (
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      // collision detected
      object.markedForDeletion = true;
      score++;
      explosions.push(new Explosion(object.x, object.y, object.width));
    }
  });
});

function animate(timeStamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
  let deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;
  timeToNextRaven += deltaTime - 7;
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort(function (a, b) {
      return a.width - b.width;
    });
  }
  ctx.drawImage(backgroundSky, 0, 0, 1325, 630);
  drawScore();
  drawLevel();
  [...particles, ...ravens, ...explosions].forEach((object) =>
    object.update(deltaTime)
  );
  [...particles, ...ravens, ...explosions].forEach((object) => object.draw());
  ravens = ravens.filter((object) => !object.markedForDeletion);
  explosions = explosions.filter((object) => !object.markedForDeletion);
  particles = particles.filter((object) => !object.markedForDeletion);
  if (!gameOver) requestAnimationFrame(animate);
  else {
    drawGameOver();
    pauseMusic();
  }
}

const background = new Audio();
background.src = "audios/backgroundMusic.mp3";

function playMusic() {
  background.play();
}

function pauseMusic() {
  background.pause();
}

const start = document.getElementById("start");
const restart = document.getElementById("restart");

if (
  start.addEventListener("click", () => {
    const startSound = new Audio();
    startSound.src = "audios/start.wav";
    startSound.play();
    animate(0);
    playMusic();
  })
);

if (
  restart.addEventListener("click", () => {
    const startSound = new Audio();
    startSound.src = "audios/restart.wav";
    startSound.play();
    setTimeout(function () {
      window.location.reload();
    }, 300);
  })
);
