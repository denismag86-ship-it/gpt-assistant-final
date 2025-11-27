import { AppSettings, Message, StreamChunk } from '../types';

export class UniversalLLMService {
  /**
   * Streams chat completion from any OpenAI-compatible API
   */
  static async streamChat(
    messages: Message[],
    settings: AppSettings,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const isLocalhost = settings.apiUrl.includes('localhost') || settings.apiUrl.includes('127.0.0.1');
      if (!settings.apiKey && !isLocalhost) {
        throw new Error("API Key is required. Please configure it in settings.");
      }

      if (!settings.apiUrl) {
        throw new Error("API URL is missing.");
      }

      // Smart URL normalization
      let finalUrl = settings.apiUrl.trim();
      if (finalUrl.endsWith('/')) {
        finalUrl = finalUrl.slice(0, -1);
      }

      // Auto-append correct endpoint based on provider
      if (!finalUrl.endsWith('/chat/completions')) {
        if (finalUrl.includes('googleapis.com')) {
          if (!finalUrl.includes('/openai')) {
            finalUrl += '/v1beta/openai';
          }
          finalUrl += '/chat/completions';
        } else if (finalUrl.includes('anthropic.com')) {
          finalUrl = finalUrl.replace(/\/chat\/completions$/, '');
          finalUrl += '/messages';
        } else if (finalUrl.endsWith('/v1')) {
          finalUrl += '/chat/completions';
        } else if (!finalUrl.includes('/v1/')) {
          finalUrl += '/v1/chat/completions';
        }
        console.log(`✓ Auto-corrected API URL: ${finalUrl}`);
      }

      // Format messages with system prompt
      const apiMessages = [
        { role: 'system', content: settings.systemPrompt || 'You are a helpful assistant.' },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ];

      console.log(`→ Connecting to: ${finalUrl}`);
      console.log(`→ Model: ${settings.model}`);

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      let fetchUrl = finalUrl;
      const isGoogle = finalUrl.includes('googleapis.com');
      const isAnthropic = finalUrl.includes('anthropic.com');

      // Google: API key in query parameter (CORS workaround)
      if (isGoogle && settings.apiKey) {
        const separator = fetchUrl.includes('?') ? '&' : '?';
        fetchUrl = `${fetchUrl}${separator}key=${settings.apiKey}`;
      }
      // Anthropic: special header format
      else if (isAnthropic && settings.apiKey) {
        headers['x-api-key'] = settings.apiKey;
        headers['anthropic-version'] = '2023-06-01';
      }
      // Standard: Bearer token
      else if (settings.apiKey) {
        headers['Authorization'] = `Bearer ${settings.apiKey}`;
      }

      // Handle temperature for reasoning models
      const isReasoningModel = /^o[1-4]|thinking|reasoner/.test(settings.model);
      const finalTemperature = isReasoningModel ? 1 : settings.temperature;
      console.log(`→ Temperature: ${finalTemperature}`);

      // Make request
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: settings.model,
          messages: apiMessages,
          temperature: finalTemperature,
          stream: true,
        })
      });

      // Handle errors
      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;

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
            const cleanText = textBody.replace(/<[^>]*>?/gm, ' ').slice(0, 200);
            errorMessage = `Network Error (${response.status}): ${cleanText}...`;
          }
        } catch (e) {
          // Fallback
        }

        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("Response body is empty");
      }

      // Process stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.replace('data: ', '');
          if (dataStr === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const json: StreamChunk = JSON.parse(dataStr);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Noise/keepalive from provider
          }
        }
      }

      onComplete();

    } catch (error) {
      console.error('✗ LLM Service Error:', error);
      onError(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  }
}
