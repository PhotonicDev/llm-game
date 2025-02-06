import React, { useState } from "react";
import { DialogueWindow } from "./components/DialogueWindow";
import { useGameLoop } from "./hooks/useGameLoop";

export function Game() {
  const [dialogueActive, setDialogueActive] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [gameEndState, setGameEndState] = useState(null);
  const {
    gameWorld,
    player,
    dialogueSystem,
    crimeSceneNarrator,
    dialogueActive: gameDialogueActive,
    setDialogueActive: setGameDialogueActive,
  } = useGameLoop();

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickResult = gameWorld.handleClick(x, y);
    if (clickResult) {
      setDialogueActive(true);
      setGameDialogueActive(true);
      if (clickResult.type === "character") {
        setCurrentCharacter({
          type: "character",
          name: clickResult.character.characterCard.name,
          characterCard: clickResult.character.characterCard,
        });
      } else if (clickResult.type === "crime-scene") {
        const sceneId = `crime-scene-${clickResult.scene.position.x}-${clickResult.scene.position.y}`;
        setCurrentCharacter({
          type: "crime-scene",
          name: sceneId,
          scene: clickResult.scene,
        });
      }
    }
  };

  const handleCloseDialogue = () => {
    setDialogueActive(false);
    setGameDialogueActive(false);
    setCurrentCharacter(null);
  };

  const handleGameEnd = (result, message) => {
    if (result === "lose") {
      // Pick a random surviving character (except the killer) to be the next victim
      const availableVictims = gameWorld.characters.filter(
        (char) => !char.characterCard.isKiller
      );
      if (availableVictims.length > 0) {
        const nextVictim =
          availableVictims[Math.floor(Math.random() * availableVictims.length)];

        // Create a new crime scene with the victim
        gameWorld.createNewCrimeScene(nextVictim);

        // Update the message to include the new murder
        message += `\n\n${nextVictim.characterCard.name} has been murdered! A new crime scene has appeared.`;

        // Close dialogue but don't end game
        setDialogueActive(false);
        setGameDialogueActive(false);
        setCurrentCharacter(null);

        // Show temporary message about new murder
        setGameEndState({ result: "newMurder", message });
        setTimeout(() => {
          setGameEndState(null);
        }, 3000);
        return; // Add this to prevent showing game over
      }

      // Only show game over if no more victims available
      setGameEndState({
        result: "lose",
        message: "Everyone is dead! Game Over.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      setGameEndState({ result, message });
      setDialogueActive(false);
    }
  };

  return (
    <div className="game-container" style={{ position: "relative" }}>
      <canvas id="gameCanvas" onClick={handleClick} width={800} height={600} />

      {gameEndState && (
        <div className={`game-end-overlay ${gameEndState.result}`}>
          <h2>{gameEndState.message}</h2>
          {gameEndState.result === "win" && (
            <button onClick={() => window.location.reload()}>Play Again</button>
          )}
        </div>
      )}

      <DialogueWindow
        isActive={dialogueActive}
        character={currentCharacter}
        onClose={handleCloseDialogue}
        crimeSceneNarrator={crimeSceneNarrator}
        gameWorld={gameWorld}
        dialogueSystem={dialogueSystem}
        onGameEnd={handleGameEnd}
      />
    </div>
  );
}
