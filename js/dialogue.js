export class DialogueSystem {
  constructor() {
    this.baseUrl = "http://localhost:11434";
    this.maxCharsPerLine = 50;
    this.conversations = new Map(); // Single map for all conversations
  }

  async *streamResponse(characterPrompt, playerInput) {
    try {
      const requestBody = {
        model: "gemma2:2b",
        prompt: `${characterPrompt}\nPlayer: ${playerInput}\nResponse:`,
        stream: true,
      };

      console.log("🚀 Sending request:", requestBody);

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      let currentText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim()) {
            try {
              const jsonResponse = JSON.parse(line);
              if (jsonResponse.response) {
                currentText += jsonResponse.response;
                console.log("📨 Yielding response:", currentText);
                yield currentText;
              }
              if (jsonResponse.done) {
                return;
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      yield "Sorry, something went wrong.";
    }
  }

  addToHistory(speaker, message, contextId) {
    if (!message) return;

    if (!this.conversations.has(contextId)) {
      this.conversations.set(contextId, []);
    }

    const messageId = Math.random().toString(36).substring(7);
    const newMessage = {
      id: messageId,
      speaker,
      message,
      timestamp: new Date(),
    };

    const history = this.conversations.get(contextId);
    history.push(newMessage);
    console.log("�� Added message:", { speaker, message, contextId, history });
    return messageId;
  }

  updateMessage(contextId, messageId, newMessage) {
    const history = this.conversations.get(contextId);
    if (history) {
      const messageIndex = history.findIndex((msg) => msg.id === messageId);
      if (messageIndex !== -1) {
        history[messageIndex] = {
          ...history[messageIndex],
          message: newMessage,
        };
        console.log("🔄 Updated message:", { messageId, newMessage, history });
        return true;
      }
    }
    return false;
  }

  getHistory(contextId) {
    const history = this.conversations.get(contextId) || [];
    console.log("📜 Getting history:", { contextId, history });
    return [...history]; // Return a copy to prevent direct mutations
  }

  wrapText(text) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + word).length > this.maxCharsPerLine) {
        lines.push(currentLine);
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines.join("\n");
  }

  getFormattedHistory(contextId, type = "character", maxLines = 8) {
    const historyMap =
      type === "crime-scene"
        ? this.crimeSceneHistory
        : this.conversationHistories;
    const history = historyMap.get(contextId) || [];
    return history
      .slice(-maxLines)
      .map((entry) => `${entry.speaker}: ${entry.message}`);
  }

  clearHistory(contextId) {
    this.conversations.delete(contextId);
  }
}
