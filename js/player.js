export class Player {
  constructor(position) {
    this.tileSize = 32;
    this.position = {
      x: Math.floor(position.x / this.tileSize) * this.tileSize,
      y: Math.floor(position.y / this.tileSize) * this.tileSize,
    };
    this.size = this.tileSize;
    this.moving = false;
    this.moveTarget = null;
    this.moveSpeed = 4;
    this.color = "#4169E1"; // Royal blue
  }

  move(dx, dy, world) {
    if (this.moving) return;

    const newX = this.position.x + dx * this.tileSize;
    const newY = this.position.y + dy * this.tileSize;

    if (this.isValidPosition(newX, newY, world)) {
      this.moveTarget = { x: newX, y: newY };
      this.moving = true;
    }
  }

  update() {
    if (this.moving && this.moveTarget) {
      const dx = this.moveTarget.x - this.position.x;
      const dy = this.moveTarget.y - this.position.y;

      if (Math.abs(dx) < this.moveSpeed && Math.abs(dy) < this.moveSpeed) {
        // Reached target
        this.position.x = this.moveTarget.x;
        this.position.y = this.moveTarget.y;
        this.moving = false;
        this.moveTarget = null;
      } else {
        // Move towards target
        if (dx !== 0) {
          this.position.x += this.moveSpeed * (dx > 0 ? 1 : -1);
        }
        if (dy !== 0) {
          this.position.y += this.moveSpeed * (dy > 0 ? 1 : -1);
        }
      }
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(
      this.position.x + this.size / 2,
      this.position.y + this.size / 2,
      this.size / 3,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = this.color;
    ctx.fill();

    // Add direction indicator (white dot)
    ctx.beginPath();
    ctx.arc(
      this.position.x + this.size / 2,
      this.position.y + this.size / 3,
      this.size / 6,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "white";
    ctx.fill();
  }

  isValidPosition(x, y, world) {
    const gridX = Math.floor(x / world.tileSize);
    const gridY = Math.floor(y / world.tileSize);

    return (
      gridX >= 0 &&
      gridX < world.terrain[0].length &&
      gridY >= 0 &&
      gridY < world.terrain.length &&
      world.terrain[gridY][gridX] !== 2
    ); // Not water
  }
}
