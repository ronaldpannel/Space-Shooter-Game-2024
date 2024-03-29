/**@type{HTMLCanvasElement} */

class Game {
  constructor(canvas, ctx) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.enemy1 = new Enemy(this);

    this.numberOfEnemies = 50;
    this.enemyPool = [];
    this.createEnemyPool();
    this.enemyTimer = 0;
    this.enemyInterval = 1000;

    this.score = 0;
    this.playerLives;
    this.winningScore = 20;
    this.message1 = "Run!";
    this.message2 = "or get eaten";
    this.message3 = 'press enter or "R" to start!';
    this.crewImage = document.getElementById("crewSprite");
    this.crewMembers = [];
    this.gameOver = true;
    this.deBug = false;

    this.spriteTimer = 0;
    this.spriteInterval = 150;
    this.spriteUpdate = false;

    this.mouse = {
      pressed: false,
      x: undefined,
      y: undefined,
      width: 1,
      height: 1,
      fired: false,
    };
    this.resize(window.innerWidth, window.innerHeight);
    this.resetBtn = document.getElementById("reset");
    this.resetBtn.addEventListener("click", (e) => {
      this.start();
    });
    this.fullScreenBtn = document.getElementById("fullScreen");
    this.fullScreenBtn.addEventListener("click", () => {
      this.toggleFullScreen();
    });

    window.addEventListener("resize", (e) => {
      this.resize(e.target.innerWidth, e.target.innerHeight);
    });
    window.addEventListener("mousedown", (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
      this.mouse.pressed = true;
      this.mouse.fired = false;
    });
    window.addEventListener("mouseup", (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
      this.mouse.pressed = false;
    });

    window.addEventListener("touchstart", (e) => {
      this.mouse.x = e.changedTouches[0].pageX;
      this.mouse.y = e.changedTouches[0].pageY;
      this.mouse.pressed = true;
      this.mouse.fired = false;
    });
    window.addEventListener("touchend", (e) => {
      this.mouse.x = e.changedTouches[0].pageX;
      this.mouse.y = e.changedTouches[0].pageY;
      this.mouse.pressed = false;
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Enter" || e.key.toLowerCase() === "r") {
        this.start();
      } else if (e.key === " " || e.key.toLowerCase() === "f") {
        this.toggleFullScreen();
      } else if (e.key.toLowerCase() === "d") {
        this.debug = !this.debug;
      }
    });
  }

  start() {
    this.resize(window.innerWidth, window.innerHeight);
    this.score = 0;
    this.playerLives = 15;
    this.generateCrew();
    this.gameOver = false;
    this.enemyPool.forEach((enemy) => {
      enemy.reset();
    });
    for (let i = 0; i < 2; i++) {
      const enemy = this.getEnemy();
      if (enemy) enemy.start();
    }
  }
  generateCrew() {
    this.crewMembers = [];
    for (let i = 0; i < this.playerLives; i++) {
      this.crewMembers.push({
        frameX: Math.floor(Math.random() * 5),
        frameY: Math.floor(Math.random() * 5),
      });
    }
  }
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = "white";
    this.ctx.font = "30px Bangers";
    this.ctx.textAlign = "center";
    this.ctx.textBaseLine = "middle";
  }
  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
  createEnemyPool() {
    for (let i = 0; i < this.numberOfEnemies; i++) {
      let randomNumber = Math.random();
      if (randomNumber < 0.5) {
        this.enemyPool.push(new BeetleMorph(this));
      } else {
        this.enemyPool.push(new Lobstermorph(this));
      }
    }
  }
  handleEnemies(deltaTime) {
    if (this.enemyTimer < this.enemyInterval) {
      this.enemyTimer += deltaTime;
    } else {
      this.enemyTimer = 0;
      const enemy = this.getEnemy();
      if (enemy) enemy.start();
    }
  }
  getEnemy() {
    for (let i = 0; i < this.enemyPool.length; i++) {
      if (this.enemyPool[i].free) return this.enemyPool[i];
    }
  }
  triggerGameOver() {
    if (!this.gameOver) {
      this.gameOver = true;
      if (this.playerLives < 1) {
        this.message1 = "Aargh!";
        this.message2 = "The crew was eaten!";
      } else if (this.score >= this.winningScore) {
        this.message1 = "Well Done!";
        this.message2 = "you escaped the swarm!";
      }
    }
  }
  handleSpriteTimer(deltaTime) {
    if (this.spriteTimer < this.spriteInterval) {
      this.spriteTimer += deltaTime;
      this.spriteUpdate = false;
    } else {
      this.spriteTimer = 0;
      this.spriteUpdate = true;
    }
  }
  displayScore() {
    this.ctx.save();
    this.ctx.textAlign = "left";
    this.ctx.fillText("Score" + "  " + this.score, 20, 40);
    for (let i = 0; i < this.playerLives; i++) {
      const w = 20;
      const h = 45;
      this.ctx.drawImage(this.crewImage, w * this.crewMembers[i].frameX, h * this.crewMembers[i].frameY, w, h, 20 + 25 * i, 60, w, h);
    }
    this.ctx.restore();
    if (this.playerLives < 1 || this.score >= this.winningScore) {
      this.triggerGameOver();
    }
    if (this.gameOver) {
      this.ctx.textAlign = "center";
      this.ctx.font = "80px Bangers";
      this.ctx.fillText(this.message1, this.width * 0.5, this.height * 0.5);
      this.ctx.font = "30px Bangers";
      this.ctx.fillText(
        this.message2,
        this.width * 0.5,
        this.height * 0.5 + 30
      );
      this.ctx.fillText(
        this.message3,
        this.width * 0.5,
        this.height * 0.5 + 60
      );
    }
  }
  render(deltaTime) {
    this.handleSpriteTimer(deltaTime);
    this.displayScore();
    if (!this.gameOver) {
      this.handleEnemies(deltaTime);
    }

    this.enemyPool.forEach((enemy) => {
      enemy.draw();
    });
    for (let i = this.enemyPool.length - 1; i >= 0; i--) {
      this.enemyPool[i].update();
    }
  }
}

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const game = new Game(canvas, ctx);
  let lastTime;
  function animate(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(deltaTime);
    requestAnimationFrame(animate);
  }
  animate();

  //load function end
});
