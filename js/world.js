import { CrimeScene } from "./crime_scene.js";

export class GameWorld {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tileSize = 32;
    this.characters = [];
    this.selectedCharacter = null;
    this.hasInvestigatedScene = false;
    this.crimeScenes = []; // Array to hold multiple crime scenes

    // Create terrain grid
    this.terrain = this.generateTerrain();

    // Add crime scene
    this.addCrimeScene(
      new CrimeScene({
        x: 200,
        y: 250,
        victim: null, // Initial crime scene has no specific victim
        evidence: "Initial murder scene",
      })
    );

    // Create textures
    this.textures = {
      grass: "#424242",
      path: "#BC9E89",
      water: "#ff0000",
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

  addCrimeScene(crimeScene) {
    this.crimeScenes.push(crimeScene);
    this.hasInvestigatedScene = false; // Reset investigation state for new scene
  }

  createNewCrimeScene(character) {
    // Calculate new position near the killed character's location
    const newScene = new CrimeScene({
      x: character.position.x,
      y: character.position.y,
      victim: character,
      evidence: `${character.characterCard.name}'s body shows signs of the same killer. 
                Their last words mentioned ${character.characterCard.lastWords}`,
    });
    this.addCrimeScene(newScene);

    // Remove the character from the game
    this.characters = this.characters.filter((c) => c !== character);
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

    // Draw all crime scenes
    for (const crimeScene of this.crimeScenes) {
      crimeScene.draw(ctx);
    }

    // Draw characters
    for (const character of this.characters) {
      character.draw(ctx);
    }
  }

  handleClick(x, y) {
    // Check for crime scene clicks
    for (const crimeScene of this.crimeScenes) {
      const bounds = {
        x: crimeScene.position.x,
        y: crimeScene.position.y,
        width: crimeScene.size,
        height: crimeScene.size,
      };

      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.width &&
        y >= bounds.y &&
        y <= bounds.y + bounds.height
      ) {
        this.hasInvestigatedScene = true;
        return { type: "crime-scene", scene: crimeScene };
      }
    }

    // Check for character click
    for (const character of this.characters) {
      if (
        x >= character.position.x &&
        x <= character.position.x + character.size &&
        y >= character.position.y &&
        y <= character.position.y + character.size
      ) {
        this.selectedCharacter = character;
        return { type: "character", character };
      }
    }

    this.selectedCharacter = null;
    return null;
  }
}
