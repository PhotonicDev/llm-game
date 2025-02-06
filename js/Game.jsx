import React, { useState } from "react";
import { DialogueWindow } from "./components/DialogueWindow";
import { useGameLoop } from "./hooks/useGameLoop";

export function Game() {
  const [dialogueActive, setDialogueActive] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [gameEndState, setGameEndState] = useState(null);
  const { gameWorld, player, dialogueSystem, crimeSceneNarrator } =
    useGameLoop();

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickResult = gameWorld.handleClick(x, y);
    if (clickResult) {
      setDialogueActive(true);
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
    setCurrentCharacter(null);
  };

  const handleGameEnd = (result, message) => {
    setGameEndState({ result, message });
    setDialogueActive(false);

    if (result === "lose") {
      // Reset game after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);
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
