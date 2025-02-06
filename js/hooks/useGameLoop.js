import { useState, useEffect, useRef } from "react";
import { GameWorld } from "../world.js";
import { Player } from "../player.js";
import { DialogueSystem } from "../dialogue.js";
import { CharacterCard } from "../character.js";
import { characters } from "../character.js";

export function useGameLoop() {
  const [gameState, setGameState] = useState({
    gameWorld: null,
    player: null,
    dialogueSystem: null,
    crimeSceneNarrator: null,
    ctx: null,
  });
  const animationFrameRef = useRef(null);
  const keysRef = useRef(new Set());

  useEffect(() => {
    // Initialize game components
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const dialogueSystem = new DialogueSystem();
    const gameWorld = new GameWorld(canvas.width, canvas.height);

    // Add characters to the game world
    characters.forEach((character) => gameWorld.addCharacter(character));

    const player = new Player({
      x: canvas.width / 2,
      y: canvas.height / 2,
    });

    // Create the infernal investigator
    const crimeSceneNarrator = new CharacterCard(
      "Infernal Investigator",
      "Perceptive, cynical, darkly humorous",
      "A demon detective specialized in solving murders in Hell, where everyone is already evil",
      "Uncover the truth in a realm where every suspect is capable of unspeakable horror",
      "Speaks with dark humor and cynicism, mixing detective noir with infernal observations"
    );

    setGameState({
      gameWorld,
      player,
      dialogueSystem,
      crimeSceneNarrator,
      ctx,
    });

    // Set up keyboard event listeners
    const handleKeyDown = (e) => keysRef.current.add(e.key);
    const handleKeyUp = (e) => keysRef.current.delete(e.key);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Game loop
    function gameLoop() {
      if (!player.moving) {
        const dx =
          (keysRef.current.has("d") ? 1 : 0) -
          (keysRef.current.has("a") ? 1 : 0);
        const dy =
          (keysRef.current.has("s") ? 1 : 0) -
          (keysRef.current.has("w") ? 1 : 0);
        if (dx !== 0 || dy !== 0) {
          player.move(dx, dy, gameWorld);
        }
      }

      // Update and draw
      player.update();
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      gameWorld.draw(ctx);
      player.draw(ctx);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return gameState;
}
