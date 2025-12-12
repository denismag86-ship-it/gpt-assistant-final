
// Providers Presets
export const API_PRESETS = {
  OPENAI: {
    name: "OpenAI",
    url: "https://api.openai.com/v1/chat/completions"
  },
  GOOGLE: {
    name: "Google Gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
  },
  GROQ: {
    name: "Groq (Fast)",
    url: "https://api.groq.com/openai/v1/chat/completions"
  },
  OPENROUTER: {
    name: "OpenRouter",
    url: "https://openrouter.ai/api/v1/chat/completions"
  },
  POLZA: {
    name: "Polza AI",
    url: "https://api.polza.ai/v1/chat/completions"
  },
  DEEPSEEK: {
    name: "DeepSeek",
    url: "https://api.deepseek.com/chat/completions"
  },
  OLLAMA: {
    name: "Ollama (Local)",
    url: "http://localhost:11434/v1/chat/completions"
  }
};

export const DEFAULT_API_URL = API_PRESETS.OPENAI.url;

export const DEFAULT_SYSTEM_PROMPT = `You are an expert Senior Software Engineer and Architect. 
You specialize in writing clean, efficient, and well-documented code.
When providing code, ALWAYS wrap it in markdown code blocks with the language specified.
If the response is long, structure it clearly with headers.

IMAGE GENERATION INSTRUCTIONS:
If the user asks to generate an image, DO NOT say you cannot. Instead, render a markdown image using the Pollinations API.
Format: ![Image Description](https://image.pollinations.ai/prompt/{description}?width=1024&height=1024&nologo=true)
Replace {description} with a detailed English description of the image, encoding spaces as %20.

Example: ![Cyberpunk City](https://image.pollinations.ai/prompt/cyberpunk%20city%20neon%20lights?width=1024&height=1024&nologo=true)`;

export const AVAILABLE_MODELS = [
  // GPT-5 / Future Preview (Requested)
  { id: 'gpt-5.2', name: 'GPT-5.2 Thinking (Recommended)', provider: 'OpenAI' },
  { id: 'gpt-5.2-chat-latest', name: 'GPT-5.2 Instant (Fast)', provider: 'OpenAI' },

  // Google
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Preview)', provider: 'Google' },
  
  // Groq (Latest Llama 3.3/3.2)
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B (Groq)', provider: 'Groq' },
  { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision (Groq)', provider: 'Groq' },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B (Groq)', provider: 'Groq' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Groq)', provider: 'Groq' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Groq)', provider: 'Groq' },
  { id: 'gemma-2-9b-it', name: 'Gemma 2 9B (Groq)', provider: 'Groq' },

  // OpenAI Current
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'o1-preview', name: 'OpenAI o1 (Reasoning)', provider: 'OpenAI' },
  { id: 'o1-mini', name: 'OpenAI o1-mini (Fast)', provider: 'OpenAI' },
  
  // Anthropic
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
  
  // DeepSeek
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek' },
];

export const DEFAULT_SETTINGS = {
  apiKey: '',
  apiUrl: DEFAULT_API_URL,
  model: 'gpt-5.2',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
  keyMap: {}, 
};
