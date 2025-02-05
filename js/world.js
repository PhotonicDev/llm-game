export class GameWorld {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tileSize = 32;
    this.characters = [];
    this.selectedCharacter = null;

    // Create terrain grid
    this.terrain = this.generateTerrain();

    // Create textures
    this.textures = {
      grass: "#647D64",
      path: "#BC9E89",
      water: "#4F6BBF",
      flowers: "#9B93BF",
    };
  }

  generateTerrain() {
    const rows = Math.floor(this.height / this.tileSize);
    const cols = Math.floor(this.width / this.tileSize);
    const terrain = Array(rows)
      .fill()
      .map(() => Array(cols).fill(0));

    // Add path
    const midRow = Math.floor(rows / 2);
    for (let x = 0; x < cols; x++) {
      terrain[midRow][x] = 1;
      if (x % 4 === 0 && midRow + 1 < rows) {
        terrain[midRow + 1][x] = 1;
      }
    }

    // Add water
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < 2; x++) {
        terrain[y][x] = 2;
      }
    }

    // Add flowers
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (terrain[y][x] === 0 && (x + y) % 7 === 0) {
          terrain[y][x] = 3;
        }
      }
    }

    return terrain;
  }

  addCharacter(character) {
    this.characters.push(character);
  }

  draw(ctx) {
    // Draw terrain
    for (let y = 0; y < this.terrain.length; y++) {
      for (let x = 0; x < this.terrain[y].length; x++) {
        const terrainType = this.terrain[y][x];
        ctx.fillStyle = Object.values(this.textures)[terrainType];
        ctx.fillRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
        ctx.strokeStyle = "#000";
        ctx.strokeRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }

    // Draw characters
    for (const character of this.characters) {
      character.draw(ctx);
    }
  }

  handleClick(x, y) {
    for (const character of this.characters) {
      if (
        x >= character.position.x &&
        x <= character.position.x + character.size &&
        y >= character.position.y &&
        y <= character.position.y + character.size
      ) {
        this.selectedCharacter = character;
        return character;
      }
    }
    this.selectedCharacter = null;
    return null;
  }
}
