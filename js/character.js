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
  constructor(characterCard, position, color = "#FF0000") {
    this.characterCard = characterCard;
    this.position = position;
    this.color = color;
    this.size = 32;
    this.rect = {
      x: position.x,
      y: position.y,
      width: this.size,
      height: this.size,
    };
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

    // Add distinctive cross mark
    ctx.beginPath();
    const center = {
      x: this.position.x + this.size / 2,
      y: this.position.y + this.size / 2,
    };
    const markSize = this.size / 6;

    ctx.moveTo(center.x - markSize, center.y);
    ctx.lineTo(center.x + markSize, center.y);
    ctx.moveTo(center.x, center.y - markSize);
    ctx.lineTo(center.x, center.y + markSize);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Create a more sinister cast of characters
export const characters = [
  new Character(
    new CharacterCard(
      "The Collector",
      "Obsessive, methodical, unnervingly calm",
      "A demon who collects last breaths of their victims in ornate bottles. Known for their precise 'work'",
      "Find new unique specimens for their collection while avoiding suspicion",
      "Speaks with clinical detachment, frequently references their 'collection'"
    ),
    { x: 300, y: 200 },
    "#8B0000" // Dark blood red
  ),
  new Character(
    new CharacterCard(
      "Madame Viscera",
      "Aristocratic, sadistic, theatrical",
      "A fallen noble who runs an underground 'theater' where the performances are always fatal",
      "Maintain their reputation as Hell's premier artist of pain",
      "Speaks in flowery language, mixing theater terms with gruesome imagery"
    ),
    { x: 500, y: 300 },
    "#4B0082" // Deep purple
  ),
  new Character(
    new CharacterCard(
      "Dr. Torment",
      "Intellectual, experimental, unhinged",
      "A twisted scientist obsessed with studying pain thresholds and fear responses",
      "Further their 'research' into the limits of suffering",
      "Uses clinical terminology to describe horrific acts"
    ),
    { x: 400, y: 150 },
    "#006400" // Dark green
  ),
  new Character(
    new CharacterCard(
      "The Whisperer",
      "Manipulative, subtle, insidious",
      "A demon who drives others to murder through whispered suggestions",
      "Create elaborate schemes of betrayal and murder",
      "Speaks in hushed tones, often completing others' sentences"
    ),
    { x: 200, y: 400 },
    "#483D8B" // Dark slate blue
  ),
  new Character(
    new CharacterCard(
      "Sister Agony",
      "Religious zealot, delusional, intense",
      "A fallen nun who believes torture purifies souls",
      "Cleanse sinners through elaborate rituals of pain",
      "Mixes religious terminology with descriptions of torture"
    ),
    { x: 600, y: 200 },
    "#800080" // Purple
  ),
  new Character(
    new CharacterCard(
      "The Butcher",
      "Brutal, direct, prideful",
      "A demon who takes artistic pride in dismemberment",
      "Create their masterpiece of mutilation",
      "Speaks like a proud artisan about their gruesome work"
    ),
    { x: 350, y: 450 },
    "#8B4513" // Saddle brown
  ),
];
