import { CharacterCard, Character } from "./character.js";
import { DialogueSystem } from "./dialogue.js";
import { GameWorld } from "./world.js";
import { Player } from "./player.js";

// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const DIALOG_WIDTH = 700;
const DIALOG_HEIGHT = 200;
const DIALOG_X = (canvas.width - DIALOG_WIDTH) / 2;
const DIALOG_Y = canvas.height - DIALOG_HEIGHT - 20;

// Initialize game components
const dialogueSystem = new DialogueSystem();
const gameWorld = new GameWorld(canvas.width, canvas.height);
const player = new Player({
  x: canvas.width / 2,
  y: canvas.height / 2,
});

// Create characters
const characters = [
  new Character(
    new CharacterCard(
      "Elder Sage",
      "Wise, patient, and mysterious",
      "Ancient keeper of forgotten knowledge",
      "Guide worthy adventurers and protect ancient secrets",
      "Speaks in riddles and metaphors, very formal"
    ),
    { x: 300, y: 200 },
    "#7850C8" // Purple robes
  ),
  new Character(
    new CharacterCard(
      "Merchant Rose",
      "Shrewd, friendly, and opportunistic",
      "Traveling merchant from distant lands",
      "Make profitable trades and collect rare items",
      "Direct and persuasive, uses trade terminology"
    ),
    { x: 500, y: 300 },
    "#B48232" // Brown merchant clothes
  ),
];

// Add characters to world
characters.forEach((character) => gameWorld.addCharacter(character));

// Game state
let dialogueActive = false;
let currentDialogue = "";
let currentCharName = "";
let currentStream = null;
let canMove = true; // New variable to control player movement

// Get dialogue elements
const dialogueWindow = document.getElementById("dialogueWindow");
const dialogueHeader = document.getElementById("dialogueHeader");
const dialogueContent = document.getElementById("dialogueContent");
const dialogueInput = document.getElementById("dialogueInput");
const closeButton = document.getElementById("closeButton");

// Handle keyboard input
const keys = new Set();
window.addEventListener("keydown", (e) => keys.add(e.key));
window.addEventListener("keyup", (e) => keys.delete(e.key));

// Move the close button handler outside the draw function
let closeButtonBounds = null;

// Update the close button function
function drawCloseButton(ctx) {
  if (dialogueActive) {
    const buttonSize = 20;
    const buttonX = DIALOG_X + DIALOG_WIDTH - buttonSize - 10;
    const buttonY = DIALOG_Y + 5; // Move button to top of dialog

    // Store button bounds for click detection
    closeButtonBounds = {
      x: buttonX,
      y: buttonY,
      width: buttonSize,
      height: buttonSize,
    };

    // Draw button
    ctx.fillStyle = "#FF6B6B";
    ctx.fillRect(buttonX, buttonY, buttonSize, buttonSize);

    // Draw X
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(buttonX + 5, buttonY + 5);
    ctx.lineTo(buttonX + buttonSize - 5, buttonY + buttonSize - 5);
    ctx.moveTo(buttonX + buttonSize - 5, buttonY + 5);
    ctx.lineTo(buttonX + 5, buttonY + buttonSize - 5);
    ctx.stroke();
  }
}

// Update the click handler
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const character = gameWorld.handleClick(x, y);
  if (character) {
    dialogueActive = true;
    canMove = false;
    currentCharName = character.characterCard.name;
    dialogueHeader.textContent = currentCharName;
    dialogueWindow.style.display = "block";

    // Add initial greeting if this is a new conversation
    if (!dialogueSystem.conversationHistories.has(currentCharName)) {
      const greeting = `Hello, I am ${currentCharName}. How can I help you?`;
      dialogueSystem.addToHistory(currentCharName, greeting, currentCharName);
    }
    updateDialogueContent();
    dialogueInput.focus();
  }
});

// Update the dialogue input handler
dialogueInput.addEventListener("keypress", async (e) => {
  if (
    e.key === "Enter" &&
    dialogueInput.value.trim() &&
    gameWorld.selectedCharacter
  ) {
    const playerInput = dialogueInput.value.trim();
    dialogueSystem.addToHistory("You", playerInput, currentCharName);
    dialogueInput.value = "";
    updateDialogueContent();

    // Show loading indicator
    addLoadingIndicator();

    try {
      const responseGenerator = dialogueSystem.streamResponse(
        gameWorld.selectedCharacter.characterCard.toPrompt(),
        playerInput
      );

      // Create a temporary message for streaming
      const streamingMessage = document.createElement("div");
      streamingMessage.className = "message";
      streamingMessage.innerHTML = `
        <span class="speaker">${currentCharName}:</span>
        <span class="text"></span>
      `;
      removeLoadingIndicator();
      dialogueContent.appendChild(streamingMessage);
      dialogueContent.scrollTop = dialogueContent.scrollHeight;

      // Update the streaming message as we receive responses
      for await (const response of responseGenerator) {
        const textSpan = streamingMessage.querySelector(".text");
        textSpan.textContent = response;
        dialogueContent.scrollTop = dialogueContent.scrollHeight;
      }

      // After streaming is complete, add to history
      const finalResponse = streamingMessage.querySelector(".text").textContent;
      dialogueSystem.addToHistory(
        currentCharName,
        finalResponse,
        currentCharName
      );
      streamingMessage.remove();
      updateDialogueContent();
    } catch (error) {
      console.error("Error getting response:", error);
      removeLoadingIndicator();
      dialogueSystem.addToHistory(
        "System",
        "Error: Could not get response",
        currentCharName
      );
      updateDialogueContent();
    }
  }
});

// Handle close button
closeButton.addEventListener("click", () => {
  dialogueActive = false;
  canMove = true;
  dialogueWindow.style.display = "none";
  dialogueContent.innerHTML = "";
  dialogueInput.value = "";
});

// Update the dialogue content update function
function updateDialogueContent() {
  const history = dialogueSystem.getFormattedHistory(currentCharName);
  dialogueContent.innerHTML = history
    .map((line) => {
      const [speaker, ...messageParts] = line.split(": ");
      const message = messageParts.join(": ");
      return `
                <div class="message">
                    <span class="speaker">${speaker}:</span>
                    <span class="text">${message}</span>
                </div>
            `;
    })
    .join("");

  dialogueContent.scrollTop = dialogueContent.scrollHeight;
}

function addLoadingIndicator() {
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "message loading";
  loadingDiv.innerHTML =
    '<span class="speaker">System:</span> <span class="text">Thinking...</span>';
  dialogueContent.appendChild(loadingDiv);
  dialogueContent.scrollTop = dialogueContent.scrollHeight;
}

function removeLoadingIndicator() {
  const loadingElement = dialogueContent.querySelector(".loading");
  if (loadingElement) {
    loadingElement.remove();
  }
}

// Update game loop to only handle game rendering
function gameLoop() {
  // Handle player movement only if allowed
  if (!player.moving && canMove) {
    const dx = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
    const dy = (keys.has("s") ? 1 : 0) - (keys.has("w") ? 1 : 0);
    if (dx !== 0 || dy !== 0) {
      player.move(dx, dy, gameWorld);
    }
  }

  // Update
  player.update();

  // Draw
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  gameWorld.draw(ctx);
  player.draw(ctx);

  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
