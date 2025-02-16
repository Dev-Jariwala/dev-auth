/* Provider	Model
OpenAI	gpt-4o				
OpenAI	gpt-4o-mini				
OpenAI	gpt-4-turbo				
OpenAI	gpt-4				
OpenAI	o1				
OpenAI	o1-mini				
OpenAI	o1-preview				
Anthropic	claude-3-5-sonnet-20241022				
Anthropic	claude-3-5-sonnet-20240620				
Anthropic	claude-3-5-haiku-20241022				
Mistral	pixtral-large-latest				
Mistral	mistral-large-latest				
Mistral	mistral-small-latest				
Mistral	pixtral-12b-2409				
Google Generative AI	gemini-2.0-flash-exp				
Google Generative AI	gemini-1.5-flash				
Google Generative AI	gemini-1.5-pro				
Google Vertex	gemini-2.0-flash-exp				
Google Vertex	gemini-1.5-flash				
Google Vertex	gemini-1.5-pro				
xAI Grok	grok-2-1212				
xAI Grok	grok-2-vision-1212				
xAI Grok	grok-beta				
xAI Grok	grok-vision-beta				
DeepSeek	deepseek-chat				
DeepSeek	deepseek-reasoner				
Cerebras	llama3.1-8b				
Cerebras	llama3.3-70b				
Groq	llama-3.3-70b-versatile				
Groq	llama-3.1-8b-instant				
Groq	mixtral-8x7b-32768				
Groq	gemma2-9b-it */
export const PROVIDERS = {
    google: {
        label: "Google",
        icon: '/svgs/google.svg',
        models: [
            { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
            { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash-001" }
        ]
    },
    openai: {
        label: "OpenAI",
        icon: '/svgs/openai.svg',
        models: [
            { label: "GPT-4O", value: "gpt-4o" },
            { label: "GPT-4O Mini", value: "gpt-4o-mini" },
            { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
            { label: "GPT-4", value: "gpt-4" },
            { label: "O1", value: "o1" },
            { label: "O1 Mini", value: "o1-mini" },
            { label: "O1 Preview", value: "o1-preview" }
        ]
    },
    anthropic: {
        label: "Anthropic",
        icon: '/svgs/anthropic.svg',
        models: [
            { label: "Claude 3.5 Sonnet 20241022", value: "claude-3-5-sonnet-20241022" },
            { label: "Claude 3.5 Sonnet 20240620", value: "claude-3-5-sonnet-20240620" },
            { label: "Claude 3.5 Haiku 20241022", value: "claude-3-5-haiku-20241022" }
        ]
    },
    mistral: {
        label: "Mistral",
        icon: '/svgs/mistral.svg',
        models: [
            { label: "Pixtral Large Latest", value: "pixtral-large-latest" },
            { label: "Mistral Large Latest", value: "mistral-large-latest" },
            { label: "Mistral Small Latest", value: "mistral-small-latest" },
            { label: "Pixtral 12B 2409", value: "pixtral-12b-2409" }
        ]
    },
    deepseek: {
        label: "DeepSeek",
        icon: '/svgs/deepseek.svg',
        models: [
            { label: "DeepSeek Chat", value: "deepseek-chat" },
            { label: "DeepSeek Reasoner", value: "deepseek-reasoner" }
        ]
    },
    meta: {
        label: "meta",
        icon: '/svgs/meta.svg',
        models: [
            { label: "LLaMA 3.1 8B", value: "llama3.1-8b" },
            { label: "LLaMA 3.3 70B", value: "llama3.3-70b" }
        ]
    },
}