// Add after game state variables
let killer = null;
let evidence = new Map(); // Maps characters to their evidence
let crimeSceneEvidence = new Map(); // Physical evidence at the crime scene
let victimName = "Damned Soul #471";
let causeOfDeath = "";

// Add this function to set up the murder mystery
function setupMurderMystery() {
  // Randomly select killer from characters
  const possibleKillers = [...characters];
  killer = possibleKillers[Math.floor(Math.random() * possibleKillers.length)];

  // Possible murder weapons and their associated evidence
  const murderMethods = [
    {
      weapon: "cursed dagger",
      evidence: "stabbing wounds with unholy residue",
      traces: [
        "traces of sulfur on hands",
        "small cuts on fingers",
        "dagger sheath fragment",
      ],
    },
    {
      weapon: "soul-draining crystal",
      evidence: "completely drained life force",
      traces: [
        "crystal dust residue",
        "magical burns on hands",
        "faint ethereal glow",
      ],
    },
    {
      weapon: "demonic poison",
      evidence: "corrupted blood vessels",
      traces: ["alchemical stains", "rare herb fragments", "distinctive smell"],
    },
  ];

  // Select random murder method
  const murderMethod =
    murderMethods[Math.floor(Math.random() * murderMethods.length)];
  causeOfDeath = murderMethod.evidence;

  // Set up evidence for each character
  characters.forEach((char) => {
    const charEvidence = new Set();

    if (char === killer) {
      // Killer gets incriminating evidence
      charEvidence.add(murderMethod.traces[0]);
      charEvidence.add(murderMethod.traces[1]);
    }

    // Add some random non-incriminating evidence to everyone
    const randomEvidence = [
      "traces of brimstone",
      "common hell-flower pollen",
      "ash marks",
      "burnt clothing",
      "infernal residue",
    ];

    // Add 1-2 random pieces of evidence to each character
    for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
      charEvidence.add(
        randomEvidence[Math.floor(Math.random() * randomEvidence.length)]
      );
    }

    evidence.set(char.characterCard.name, Array.from(charEvidence));
  });

  // Set up crime scene evidence
  crimeSceneEvidence.set("body", [
    causeOfDeath,
    murderMethod.traces[2],
    "signs of a struggle",
    "scorch marks on the ground",
  ]);
}

// Update the crime scene click handler to include evidence examination
canvas.addEventListener("click", async (e) => {
  // ... existing click handler code ...

  if (clickResult) {
    if (clickResult.type === "character") {
      // Add evidence to character's initial dialogue
      const charEvidence = evidence.get(
        clickResult.character.characterCard.name
      );
      if (charEvidence) {
        // Add subtle hints about evidence in their appearance
        const evidenceHint = `You notice ${charEvidence[0]} as you approach.`;
        dialogueSystem.addToHistory(
          "Detective's Mind",
          evidenceHint,
          currentCharName
        );
      }
      // ... rest of character click handling ...
    } else if (clickResult.type === "crime-scene") {
      // ... existing crime scene code ...

      // Add initial crime scene description with basic evidence
      const initialEvidence = crimeSceneEvidence.get("body");
      const crimeSceneDesc = `The body of ${victimName} lies before you, showing ${initialEvidence[0]}. ${initialEvidence[3]}.`;
      dialogueSystem.addToHistory(
        "Detective's Mind",
        crimeSceneDesc,
        currentCharName
      );
    }
  }
});

// Call setupMurderMystery after initializing game components
setupMurderMystery();

// Update the dialogue input handler to include evidence reveals
dialogueInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter" && dialogueInput.value.trim()) {
    const input = dialogueInput.value.trim().toLowerCase();

    // Add evidence checking for character interrogation
    if (currentCharName !== "Detective's Mind") {
      const charEvidence = evidence.get(currentCharName);
      if (
        input.includes("examine") ||
        input.includes("look") ||
        input.includes("inspect")
      ) {
        const relevantEvidence = charEvidence.find(
          (ev) => input.includes(ev.split(" ")[0]) || input.includes("closely")
        );
        if (relevantEvidence) {
          dialogueSystem.addToHistory(
            "Detective's Mind",
            `Upon closer inspection, you notice ${relevantEvidence}.`,
            currentCharName
          );
        }
      }
    }

    // ... rest of input handler code ...
  }
});

// ... rest of existing code ...
