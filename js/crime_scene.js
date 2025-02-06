export class CrimeScene {
  constructor({ x, y, victim = null, evidence = "" }) {
    this.position = { x, y };
    this.size = 40;
    this.victim = victim;
    this.evidence = evidence;
    this.isInvestigated = false;
    this.clues = {
      "examine body": {
        found: false,
        description:
          "A high-ranking demon lies mutilated in an unusually artistic manner, their essence still crackling in the sulfurous air.",
        details: {
          "check wounds":
            "Multiple precise cuts form a complex ritual pattern. The killer combined torture methods from different eras of human history.",
          "examine face":
            "The victim's expression is frozen in a mix of ecstasy and agony. Their eyes have been replaced with burning crystals.",
          "inspect markings":
            "Ritualistic symbols carved into the flesh, some from ancient torture techniques, others from modern serial killers.",
          "check hands":
            "Fingers positioned in an unusual gesture, like conducting an orchestra of pain. Several fingers bear rings from different victims.",
          "analyze mutilations":
            "The mutilations show signs of multiple torture styles - clinical precision, artistic flair, and religious symbolism all present.",
        },
      },
      "search area": {
        found: false,
        description:
          "The hellscape around the body has been transformed into a grotesque display of suffering artistry.",
        details: {
          "examine altar":
            "A makeshift altar of bones and flesh, suggesting the murder was part of a ritual. Various torture implements are arranged with theatrical precision.",
          "check symbols":
            "Blood-drawn symbols combine medical diagrams with theatrical staging marks and religious iconography.",
          "inspect offerings":
            "Various 'trophies' from other victims arranged carefully - bottles of breath, preserved screams, and crystallized pain.",
          "analyze atmosphere":
            "The air itself seems charged with residual agony, suggesting multiple participants in this elaborate death scene.",
        },
      },
      "study evidence": {
        found: false,
        description:
          "Various implements and items tell a story of premeditated, collaborative murder.",
        details: {
          "check tools":
            "A combination of surgical tools, theatrical props, and religious implements, all used in the killing.",
          "examine notes":
            "Scattered pages contain medical observations, stage directions, and prayers - all focused on perfecting the art of torture.",
          "analyze residue":
            "Traces of various torture methods overlap: chemical burns, holy water marks, and theatrical smoke residue.",
          "inspect container":
            "A specialized container designed to capture and preserve the victim's final moments of suffering.",
        },
      },
    };
  }

  draw(ctx) {
    ctx.fillStyle = this.victim ? "#880000" : "#ff0000"; // Darker red for subsequent scenes
    ctx.globalAlpha = 0.3;
    ctx.fillRect(this.position.x, this.position.y, this.size, this.size);
    ctx.globalAlpha = 1.0;

    // Draw investigation marker
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.position.x + 10, this.position.y + 10);
    ctx.lineTo(
      this.position.x + this.size - 10,
      this.position.y + this.size - 10
    );
    ctx.moveTo(this.position.x + this.size - 10, this.position.y + 10);
    ctx.lineTo(this.position.x + 10, this.position.y + this.size - 10);
    ctx.stroke();
  }

  investigate(action, lastResponse) {
    let message = this.evidence;
    if (this.victim) {
      message += `\nVictim: ${this.victim.characterCard.name}`;
      message += `\nEvidence suggests connection to the first murder.`;
    }

    return {
      message,
      options: ["examine body", "search area", "analyze evidence"],
    };
  }
}
