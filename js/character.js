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
