export class DialogueSystem {
  constructor() {
    this.baseUrl = "http://localhost:11434";
    this.maxCharsPerLine = 50;
    this.conversationHistories = new Map(); // Map to store histories for each NPC
  }

  async *streamResponse(characterPrompt, playerInput) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma2:2b",
          prompt: `${characterPrompt}\nPlayer: ${playerInput}\nResponse:`,
          stream: true,
        }),
      });

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
                yield this.wrapText(currentText);
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in stream response:", error);
      yield "Sorry, something went wrong.";
    }
  }

  addToHistory(speaker, message, npcName) {
    if (!message) return;

    if (!this.conversationHistories.has(npcName)) {
      this.conversationHistories.set(npcName, []);
    }

    const history = this.conversationHistories.get(npcName);
    history.push({ speaker, message });

    // Keep last 10 messages for each NPC
    if (history.length > 10) {
      history.shift();
    }
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

  getFormattedHistory(npcName, maxLines = 8) {
    const history = this.conversationHistories.get(npcName) || [];
    return history
      .slice(-maxLines)
      .map((entry) => `${entry.speaker}: ${entry.message}`);
  }

  clearHistory(npcName) {
    this.conversationHistories.delete(npcName);
  }
}
