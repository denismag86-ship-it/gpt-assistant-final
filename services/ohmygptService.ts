
import { AppSettings, Message, Role, StreamChunk } from '../types';

export class UniversalLLMService {
  /**
   * Streams a chat completion from any OpenAI-compatible API.
   */
  static async streamChat(
    messages: Message[],
    settings: AppSettings,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      // Allow empty API Key for local models (Ollama often doesn't need one)
      const isLocalhost = settings.apiUrl.includes('localhost') || settings.apiUrl.includes('127.0.0.1');
      const apiKey = settings.apiKey ? settings.apiKey.trim() : '';

      if (!apiKey && !isLocalhost) {
        throw new Error("API Key is missing. Please configure it in settings.");
      }

      if (!settings.apiUrl) {
        throw new Error("API URL is missing. Please check settings.");
      }

      // --- SMART URL FIXER ---
      let finalUrl = settings.apiUrl.trim();
      
      // Basic normalization
      if (finalUrl.endsWith('/')) {
        finalUrl = finalUrl.slice(0, -1);
      }

      // Logic to auto-append paths if user provided a Base URL
      if (!finalUrl.endsWith('/chat/completions')) {
         // Special handling for Google Gemini OpenAI compatibility
         // Google uses /v1beta/openai/chat/completions
         // Check if 'openai' is already in the path to avoid duplication
         if (finalUrl.includes('googleapis.com') && finalUrl.includes('/openai')) {
             finalUrl += '/chat/completions';
         } 
         // Standard OpenAI-like endpoints
         else if (finalUrl.endsWith('/v1')) {
            finalUrl += '/chat/completions';
         } else if (!finalUrl.includes('/v1/')) {
            // Assume it's a generic base URL that needs standard suffix
            finalUrl += '/v1/chat/completions';
         }
         console.log(`Auto-corrected API URL to: ${finalUrl}`);
      }

      // Format messages for the API
      const apiMessages = [
        { role: Role.System, content: settings.systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ];

      console.log(`Connecting to: ${finalUrl} with model: ${settings.model}`);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Special Handling for Google Gemini
      // Google prefers the key in the query parameter for browser-based requests to avoid CORS issues with the Auth header.
      let fetchUrl = finalUrl;
      const isGoogle = finalUrl.includes('googleapis.com');

      if (isGoogle && apiKey) {
          const separator = fetchUrl.includes('?') ? '&' : '?';
          fetchUrl = `${fetchUrl}${separator}key=${apiKey}`;
          // CRITICAL: Google will fail CORS preflight if Authorization header is present when key is in URL
          delete headers['Authorization'];
      } else if (apiKey) {
          // Standard Bearer Token for everyone else (Groq, OpenAI, etc)
          headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Special handling for o1 models which require specific temperature
      const isO1 = settings.model.startsWith('o1');
      const finalTemperature = isO1 ? 1 : settings.temperature;

      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: settings.model,
          messages: apiMessages,
          temperature: finalTemperature,
          stream: true,
          // Optional: max_tokens usually helps with compatibility across diverse providers
          // max_tokens: 4096 
        })
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
        // --- ROBUST ERROR HANDLING ---
        try {
            const textBody = await response.text();
            try {
                const errorData = JSON.parse(textBody);
                if (errorData?.error?.message) {
                    errorMessage = `Provider Error: ${errorData.error.message}`;
                } else if (errorData?.message) {
                    errorMessage = `Provider Error: ${errorData.message}`;
                }
            } catch (e) {
                // If HTML (Cloudflare, Proxy errors)
                const cleanText = textBody.replace(/<[^>]*>?/gm, ' ').slice(0, 150);
                errorMessage = `Network Error (${response.status}): ${cleanText}...`;
            }
        } catch (e) {
            // Fallback
        }
        
        // Helpful hints for common errors
        if (response.status === 404 && settings.model.includes('gpt-5')) {
             errorMessage += "\n(Note: You are trying to use a future/preview model on a provider that probably doesn't support it yet.)";
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
            // Some providers send Keep-Alive comments or other noise
          }
        }
      }
      
      onComplete();

    } catch (error) {
      console.error("Universal LLM Error:", error);
      onError(error instanceof Error ? error : new Error("Unknown error occurred."));
    }
  }
}
