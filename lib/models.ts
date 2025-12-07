/**
 * AI Model Configurations
 * 
 * This file defines all available AI models for the crossword race.
 * Each model is configured with:
 * - A unique internal ID (used in frontend state)
 * - A display name (shown in UI)
 * - A gateway ID (the Vercel AI Gateway model identifier)
 * - UI customization (color, avatar)
 * 
 * Vercel AI Gateway Model ID Format:
 *   "provider/model-name"
 *   Examples: "openai/gpt-4o", "anthropic/claude-sonnet-4.5", "xai/grok-4"
 * 
 * The gateway abstracts away individual provider API keys - you only need
 * the AI_GATEWAY_API_KEY environment variable.
 */

export interface ModelConfig {
  id: string;              // Internal identifier
  name: string;            // Display name in UI
  gatewayId: string;       // Vercel AI Gateway model identifier
  color: string;           // Accent color for UI elements
  avatar: string;          // Emoji shown next to model name
  defaultSelected?: boolean; // Pre-selected when page loads
}

export const availableModels: ModelConfig[] = [
  // OpenAI Models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    gatewayId: "openai/gpt-4o",
    color: "#10a37f",       // OpenAI green
    avatar: "🤖",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    gatewayId: "openai/gpt-4o-mini",
    color: "#74aa9c",
    avatar: "🤖",
    defaultSelected: true,  // Fast and cheap - good default
  },
  
  // Anthropic Models
  {
    id: "claude-sonnet",
    name: "Claude Sonnet 4",
    gatewayId: "anthropic/claude-sonnet-4.5",
    color: "#d4a27f",       // Anthropic tan
    avatar: "🧠",
  },
  {
    id: "claude-haiku",
    name: "Claude Haiku 4.5",
    gatewayId: "anthropic/claude-haiku-4.5",
    color: "#e8c9a8",
    avatar: "🧠",
    defaultSelected: true,  // Fast Anthropic option
  },
  
  // Google Models
  {
    id: "gemini-flash",
    name: "Gemini 2.0 Flash",
    gatewayId: "google/gemini-2.0-flash",
    color: "#4285f4",       // Google blue
    avatar: "💎",
    defaultSelected: true,  // Fast Google option
  },
  
  // xAI Models
  {
    id: "grok-4",
    name: "Grok 4",
    gatewayId: "xai/grok-4",
    color: "#1da1f2",       // X/Twitter blue
    avatar: "🚀",
  },
  {
    id: "grok-4-fast",
    name: "Grok 4 Fast",
    gatewayId: "xai/grok-4-fast-non-reasoning",
    color: "#0ea5e9",
    avatar: "⚡",
    defaultSelected: true,  // Fast xAI option
  },
];

/**
 * Look up a model by its internal ID
 * Used by the API route to get the gateway ID
 */
export function getModelById(id: string): ModelConfig | undefined {
  return availableModels.find((m) => m.id === id);
}

/**
 * Get models that should be pre-selected on page load
 * Returns the "fast" tier models for quick races
 */
export function getDefaultModels(): ModelConfig[] {
  return availableModels.filter((m) => m.defaultSelected);
}
