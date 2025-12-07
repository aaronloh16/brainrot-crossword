import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { getModelById } from "@/lib/models";

export const runtime = "edge";

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
    const body: SolveRequest = await request.json();
    const { modelId, clue, length, knownLetters, direction, number } = body;

    const modelConfig = getModelById(modelId);
    if (!modelConfig) {
      return Response.json({ error: "Unknown model" }, { status: 400 });
    }

    // Use Vercel AI Gateway - it routes to the correct provider automatically
    const model = gateway(modelConfig.gatewayId);

    // Build the prompt with context about known letters
    const hasKnownLetters = knownLetters.replace(/_/g, "").length > 0;
    
    const prompt = `You are solving a crossword puzzle about Gen Z internet slang and memes.

Clue: "${clue}"
Length: ${length} letters
Direction: ${direction}
${hasKnownLetters && knownLetters !== "_".repeat(length) ? `Known letters: ${knownLetters} (underscores are unknown letters)` : ""}

Important: Respond with ONLY the answer word in uppercase letters. No explanation, no punctuation, just the word.`;

    const startTime = Date.now();
    
    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.1,
    });

    const endTime = Date.now();
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
    
    // Check if it's an API key error
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
