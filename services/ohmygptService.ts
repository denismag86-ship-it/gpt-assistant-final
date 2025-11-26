import { AppSettings, Message, Role, StreamChunk } from '../types';

export class OhMyGPTService {
  /**
   * Streams a chat completion from the configured API.
   */
  static async streamChat(
    messages: Message[],
    settings: AppSettings,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      if (!settings.apiKey) {
        throw new Error("API Key is missing. Please configure it in settings.");
      }

      if (!settings.apiUrl) {
        throw new Error("API URL is missing. Please check settings.");
      }

      // Format messages for the API
      const apiMessages = [
        { role: Role.System, content: settings.systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ];

      console.log(`Connecting to: ${settings.apiUrl} with model: ${settings.model}`);

      const response = await fetch(settings.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: apiMessages,
          temperature: settings.temperature,
          stream: true
        })
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData?.error?.message) {
                errorMessage = `API Error: ${errorData.error.message}`;
            }
        } catch (e) {
            // Cannot parse error json, stick to status text
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("Response body is empty");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split("\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const dataStr = trimmed.replace("data: ", "");
          if (dataStr === "[DONE]") {
            onComplete();
            return;
          }

          try {
            const json: StreamChunk = JSON.parse(dataStr);
            const content = json.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.warn("Failed to parse stream chunk", e);
          }
        }
      }
      
      onComplete();

    } catch (error) {
      console.error("OhMyGPT API Error:", error);
      onError(error instanceof Error ? error : new Error("Unknown error occurred. Check console for details."));
    }
  }
}