import React, { useState, useRef, useEffect } from "react";

export function DialogueWindow({
  isActive,
  character,
  onClose,
  crimeSceneNarrator,
  gameWorld,
  dialogueSystem,
  onGameEnd,
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [debug, setDebug] = useState(false);
  const [showBlameButton, setShowBlameButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isActive && character) {
      // Load existing history or initialize new conversation
      const history = dialogueSystem.getHistory(character.name);
      setMessages(history);

      // Add greeting only if this is a new conversation
      if (history.length === 0) {
        if (character.type === "character") {
          const initialPrompt = `${character.characterCard.toPrompt()}\n\nContext: A detective approaches you seeking information about a murder case in Hell.\nResponse:`;
          handleAIResponse(initialPrompt);
        } else if (character.type === "crime-scene") {
          const prompt = `${crimeSceneNarrator.toPrompt()}\n\nThe detective approaches a disturbing scene in Hell. The air crackles with malevolent energy. Player: observe scene\nResponse:`;
          handleAIResponse(prompt);
        }
      }
    }
  }, [isActive, character]);

  useEffect(() => {
    // Add null check for gameWorld
    if (!gameWorld) return;

    const hasInvestigated = gameWorld.hasInvestigatedScene;
    const isCharacterDialog = character?.type === "character";
    console.log("Investigation state:", { hasInvestigated, isCharacterDialog }); // Debug log

    if (isCharacterDialog && hasInvestigated) {
      setShowBlameButton(true);
    } else {
      setShowBlameButton(false);
    }
  }, [character, gameWorld?.hasInvestigatedScene]); // Use optional chaining in dependency array

  useEffect(() => {
    if (gameWorld) {
      setIsLoading(false);
    }
  }, [gameWorld]);

  async function handleAIResponse(prompt) {
    try {
      console.log("Sending prompt:", prompt);
      const responseGenerator = dialogueSystem.streamResponse(prompt, "");
      const messageId = dialogueSystem.addToHistory(
        character.name,
        "...",
        character.name
      );
      setMessages(dialogueSystem.getHistory(character.name));

      let fullResponse = "";
      for await (const response of responseGenerator) {
        console.log("Received response chunk:", response);
        fullResponse = response;
        dialogueSystem.updateMessage(character.name, messageId, fullResponse);
        const updatedHistory = dialogueSystem.getHistory(character.name);
        console.log("Updated messages:", updatedHistory);
        setMessages([...updatedHistory]);
      }
    } catch (error) {
      console.error("Error in handleAIResponse:", error);
      dialogueSystem.addToHistory(
        "System",
        "Error: Could not get response",
        character.name
      );
      setMessages([...dialogueSystem.getHistory(character.name)]);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput("");

    dialogueSystem.addToHistory("You", userInput, character.name);
    setMessages(dialogueSystem.getHistory(character.name));

    if (character.type === "crime-scene") {
      const result = gameWorld.crimeScene.investigate(
        userInput,
        messages[messages.length - 1]?.message
      );

      const prompt = `${crimeSceneNarrator.toPrompt()}\n\nContext: The detective is investigating a murder scene in Hell. They just ${userInput}.\nAvailable actions: ${result.options.join(
        ", "
      )}\nFactual information: ${
        result.message
      }\n\nDescribe the investigation and findings in an atmospheric way, maintaining suspense. Don't reveal more than the factual information provides.\nResponse:`;

      console.log("Crime scene prompt:", prompt);
      await handleAIResponse(prompt);
    } else {
      console.log("Character info:", {
        name: character.name,
        type: character.type,
        characterCard: character.characterCard,
      });
      const characterPrompt = character.characterCard.toPrompt();
      console.log("Character prompt:", characterPrompt);
      const prompt = `${characterPrompt}\n\nPlayer: ${userInput}\nResponse:`;
      await handleAIResponse(prompt);
    }
  };

  const handleBlame = async () => {
    const isKiller = character.characterCard.isKiller;
    const blamePrompt = isKiller
      ? `${character.characterCard.toPrompt()}\n\nContext: The detective has discovered your guilt and is confronting you about the murder. How do you react?\nResponse:`
      : `${character.characterCard.toPrompt()}\n\nContext: The detective is wrongly accusing you of murder. How do you react?\nResponse:`;

    dialogueSystem.addToHistory(
      "You",
      "I know you're the killer!",
      character.name
    );
    setMessages(dialogueSystem.getHistory(character.name));

    await handleAIResponse(blamePrompt);

    setTimeout(() => {
      if (isKiller) {
        onGameEnd(
          "win",
          `Congratulations! You caught the killer: ${character.name}!`
        );
      } else {
        onGameEnd(
          "lose",
          `Wrong accusation! ${character.name} was innocent. Game Over.`
        );
      }
    }, 2000);
  };

  if (!isActive || isLoading) return null;

  return (
    <div className="dialogue-window">
      <div className="dialogue-header">
        <h2>
          {character.type === "crime-scene" ? "Investigation" : character.name}
        </h2>
        <div className="header-buttons">
          {showBlameButton && (
            <button
              onClick={handleBlame}
              className="blame-button"
              style={{ display: "inline-block" }}
            >
              Blame for Murder
            </button>
          )}
          <button onClick={onClose}>×</button>
        </div>
      </div>

      <div className="dialogue-content">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <span className="speaker">{msg.speaker}:</span>
            <span className="text">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="dialogue-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            character.type === "crime-scene"
              ? "What would you like to investigate?"
              : "Type your message..."
          }
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
