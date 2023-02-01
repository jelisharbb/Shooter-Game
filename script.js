const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];
class Raven {
  constructor() {
    this.width = 100;
    this.height = 50;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 5 + 3;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
  }
  update() {
    this.x -= this.directionX;
    if (this.x < 0 - this.width) this.markedForDeletion = true;
  }
  draw() {
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

function animate(timeStamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;
  timeToNextRaven += deltaTime;
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
  }
  [...ravens].forEach((object) => object.update());
  [...ravens].forEach((object) => object.draw());
  ravens = ravens.filter((object) => !object.markedForDeletion);
  requestAnimationFrame(animate);
}

animate(0);
