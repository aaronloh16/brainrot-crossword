/**
 * API Route: /api/solve
 * 
 * This endpoint handles crossword clue solving requests from the frontend.
 * It uses Vercel AI Gateway to route requests to different AI providers
 * (OpenAI, Anthropic, Google, xAI) using a single API key.
 * 
 * Rate Limiting:
 * - Uses Upstash Redis for distributed rate limiting (optional)
 * - Falls back to allowing requests if Redis is not configured
 * - Limits: 50 requests per minute per IP
 */

import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { getModelById } from "@/lib/models";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const runtime = "edge";

// Initialize rate limiter if Redis/KV credentials are available
// Supports both Vercel KV (KV_REST_API_*) and Upstash (UPSTASH_REDIS_*)
let ratelimit: Ratelimit | null = null;

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  // Limit: 5 games per hour
  // Each game = 13 clues × 4 models = 52 API calls
  // 5 games = 260 calls, adding buffer for retries = 300
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(300, "1 h"), // ~5 full games per hour
    analytics: true,
    prefix: "rizzword",
  });
}

// Request body shape from the frontend
interface SolveRequest {
  modelId: string;
  clue: string;
  length: number;
  knownLetters: string;
  direction: "across" | "down";
  number: string;
}

export async function POST(request: Request) {
  try {
    // Rate limiting check (if configured)
    if (ratelimit) {
      const ip = request.headers.get("x-forwarded-for") ?? 
                 request.headers.get("x-real-ip") ?? 
                 "anonymous";
      
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      
      if (!success) {
        const minutesLeft = Math.ceil((reset - Date.now()) / 60000);
        return Response.json(
          { 
            error: `You've played too many games! Please wait ${minutesLeft} minutes and try again. (Limit: ~5 games/hour)`,
            limit,
            reset,
          },
          { 
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    }

    const body: SolveRequest = await request.json();
    const { modelId, clue, length, knownLetters, direction, number } = body;

    // Look up the model configuration to get the gateway ID
    const modelConfig = getModelById(modelId);
    if (!modelConfig) {
      return Response.json({ error: "Unknown model" }, { status: 400 });
    }

    // Create model instance using Vercel AI Gateway
    const model = gateway(modelConfig.gatewayId);

    // Check if we have any known letters from intersecting words
    const hasKnownLetters = knownLetters.replace(/_/g, "").length > 0;
    
    // Construct the prompt
    const prompt = `You are solving a crossword puzzle about Gen Z internet slang and memes.

Clue: "${clue}"
Length: ${length} letters
Direction: ${direction}
${hasKnownLetters && knownLetters !== "_".repeat(length) ? `Known letters: ${knownLetters} (underscores are unknown letters)` : ""}

Important: Respond with ONLY the answer word in uppercase letters. No explanation, no punctuation, just the word.`;

    const startTime = Date.now();
    
    // Call the AI model through the gateway
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.1,
    });

    const endTime = Date.now();
    
    // Clean up the response
    const answer = text.trim().toUpperCase().replace(/[^A-Z]/g, "");

    return Response.json({
      answer,
      modelId,
      clueNumber: number,
      direction,
      timeMs: endTime - startTime,
    });
  } catch (error) {
    console.error("Solve error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isKeyError = errorMessage.includes("API key") || errorMessage.includes("AI_GATEWAY");
    
    return Response.json(
      { 
        error: isKeyError 
          ? "AI Gateway API key missing. Set AI_GATEWAY_API_KEY in your .env file" 
          : errorMessage 
      },
      { status: 500 }
    );
  }
}
