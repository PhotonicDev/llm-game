export class CharacterCard {
  constructor(name, personality, background, goals, speechStyle) {
    this.name = name;
    this.personality = personality;
    this.background = background;
    this.goals = goals;
    this.speechStyle = speechStyle;
  }

  toPrompt() {
    return `You are ${this.name}, with the following traits:
Background: ${this.background}
Personality: ${this.personality}
Goals: ${this.goals}
Speech style: ${this.speechStyle}

Respond in character, keeping responses concise and natural.`;
  }
}

export class Character {
  constructor(characterCard, position, spriteNumber) {
    this.characterCard = characterCard;
    this.position = position;
    this.size = 56;
    this.frameWidth = 48;
    this.frameHeight = 48;
    this.currentFrame = 0;
    this.isLoaded = false;

    // Create and load sprite
    this.sprite = new Image();
    this.sprite.onload = () => {
      this.isLoaded = true;
    };
    this.sprite.onerror = (e) => {
      console.error(`Failed to load sprite for ${characterCard.name}:`, e);
    };

    this.sprite.src = "sprites/human" + spriteNumber + ".png";
  }

  draw(ctx) {
    ctx.save();

    if (!this.isLoaded || !this.sprite.complete || !this.sprite.naturalWidth) {
      // Draw fallback shape if sprite isn't loaded
      ctx.beginPath();
      ctx.arc(
        this.position.x + this.size / 2,
        this.position.y + this.size / 2,
        this.size / 3,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#FF0000";
      ctx.fill();
    } else {
      try {
        // Use our original frame dimensions since we know the sprite sheet structure
        const frameWidth = 48; // Single frame width
        const frameHeight = 48; // Single frame height
        const frameX = 0; // First frame X position
        const frameY = 0; // First frame Y position

        ctx.imageSmoothingEnabled = false;

        // Draw just the first frame from the sprite sheet
        ctx.drawImage(
          this.sprite,
          frameX,
          frameY,
          frameWidth,
          frameHeight,
          this.position.x,
          this.position.y,
          this.size,
          this.size
        );
      } catch (error) {
        console.error("Error drawing sprite:", error);
        console.log("Sprite details:", {
          complete: this.sprite.complete,
          naturalWidth: this.sprite.naturalWidth,
          naturalHeight: this.sprite.naturalHeight,
          src: this.sprite.src,
          dimensions: `${this.sprite.width}x${this.sprite.height}`,
        });
      }
    }

    // Draw name
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    const nameX = this.position.x + this.size / 2;
    const nameY = this.position.y - 5;
    ctx.fillText(this.characterCard.name, nameX, nameY);

    ctx.restore();
  }
}

// Create a more sinister cast of characters
export const characters = [
  new Character(
    new CharacterCard(
      "Dr. Mortis",
      "Methodical, precise, theatrical",
      "A demon surgeon who combines medical expertise with artistic flair",
      "Perfecting the art of suffering through surgical precision",
      "Speaks clinically but with dramatic flourish",
      true, // isKiller
      "something about the surgeon's perfect cuts..." // lastWords
    ),
    { x: 300, y: 200 },
    0 // Use human0.png
  ),
  new Character(
    new CharacterCard(
      "Sister Pain",
      "Sadistic, religious, meticulous",
      "A fallen nun who found her calling in Hell's torture chambers",
      "Bringing divine suffering to the damned",
      "Mixes religious terminology with torture techniques",
      false,
      "the holy water burns..." // lastWords
    ),
    { x: 400, y: 300 },
    1 // Use human1.png
  ),
  new Character(
    new CharacterCard(
      "Director Agony",
      "Artistic, passionate, perfectionist",
      "A theatrical director who stages elaborate death scenes",
      "Creating masterpieces of suffering",
      "Uses dramatic and artistic metaphors",
      false,
      "the stage was set perfectly..." // lastWords
    ),
    { x: 500, y: 200 },
    2 // Use human2.png
  ),
  new Character(
    new CharacterCard(
      "Collector Vex",
      "Obsessive, analytical, proud",
      "A collector of rare torture implements and pain artifacts",
      "Curating the finest collection of suffering in Hell",
      "Speaks like an art curator describing masterpieces",
      false,
      "their collection was incomplete..." // lastWords
    ),
    { x: 600, y: 300 },
    3 // Use human3.png
  ),
  new Character(
    new CharacterCard(
      "Professor Torment",
      "Academic, experimental, detached",
      "A scholar of pain who conducts twisted experiments",
      "Advancing the science of suffering",
      "Uses academic language to describe torture",
      false,
      "the experiment wasn't finished..." // lastWords
    ),
    { x: 700, y: 200 },
    4 // Use human4.png
  ),
  new Character(
    new CharacterCard(
      "Maestro Malice",
      "Musical, elegant, sophisticated",
      "A composer who orchestrates symphonies of screams",
      "Creating harmonies of horror",
      "Describes everything in musical terms",
      false,
      "the final note was perfect..." // lastWords
    ),
    { x: 550, y: 400 },
    5 // Use human5.png
  ),
];
