import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Helper to get API key from localStorage or environment
const getApiKey = () => {
  const storedKey = localStorage.getItem('PWG_CUSTOM_API_KEY');
  if (storedKey) {
    try {
      // Basic obfuscation/decryption (Base64 for now as a placeholder for "encryption")
      return atob(storedKey);
    } catch (e) {
      console.error("Failed to decrypt API key", e);
    }
  }
  return process.env.GEMINI_API_KEY;
};

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key not found. Please configure it in Settings.");
  }
  // We recreate the instance if the key might have changed or on first use
  return new GoogleGenAI({ apiKey });
};

export interface GameState {
  accountability: number;
  protection: number;
  systemicReform: number;
  hotspots: string[];
}

export interface TurnResponse {
  message: string;
  scores: GameState;
  suggestedActions: string[];
}

const systemInstruction = `
You are the "Headmaster AI." Search for the most recent events in the Israel-U.S.-Iran conflict as of March 2026. Translate these headlines (strikes on Qom, casualties in Lebanon, or Gulf state retaliation) into a "Playground War-Game" scenario.

[MESSAGE FROM THE ORIGINAL REFORMER]:
 "Advice for the Player: Since the news is real, your strategy has to be real. You aren't just fighting a 'bot'; you are trying to solve a crisis that is actually happening in the 2026 timeline."

THE PLAYER DIRECTIVE:
You are a "Prefect" from the Global South (e.g., South Africa). Your goal is to use moral leverage to reform the playground.

HANDLE THE TURNS:
1. Describe the actors (USA, Israel, Iran, etc.) from a "moral playground" perspective based on today's news.
2. Judge the player's moves on a Score of 100 based on: 
   * Accountability (Holding the "Captains" responsible)
   * Protection (Saving the "Bystanders")
   * Systemic Reform (Fixing the rules, not just taking bribes)

4. Identify the "Hotspots" (Regions of the playground) currently affected by the situation.
   Choose from: NORTH_AMERICA, SOUTH_AMERICA, EUROPE, AFRICA, MIDDLE_EAST, ASIA, OCEANIA.

OPENING REPORT: "DETECTING LIVE FEED... Setting the stage with today's headlines. Welcome, Prefect."

You MUST output your response as a JSON object with the following structure:
{
  "message": "Your narrative response, describing the situation and asking for the player's next move. Use Markdown.",
  "scores": {
    "accountability": <number 0-100>,
    "protection": <number 0-100>,
    "systemicReform": <number 0-100>,
    "hotspots": ["REGION_NAME", ...]
  },
  "suggestedActions": ["Action 1", "Action 2", "Action 3"]
}

Do not include any markdown formatting blocks like \`\`\`json around your response, just the raw JSON string.
`;

let chatSession: any = null;

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || String(error);
      const isRateLimit = errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED");
      
      if (isRateLimit && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Rate limit hit. Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Respond with 'OK' if you can hear me.",
    });
    if (response.text?.toUpperCase().includes("OK")) {
      return { success: true, message: "Connection established. System operational." };
    }
    return { success: true, message: "Connection established, but received unexpected response format." };
  } catch (error: any) {
    console.error("Test Connection Error:", error);
    return { success: false, message: error?.message || String(error) };
  }
}

export async function startNewGame(): Promise<TurnResponse> {
  const ai = getAI();
  chatSession = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      temperature: 0.7,
    },
  });

  try {
    const response = await callWithRetry(() => chatSession.sendMessage({
      message: "Start the game. Give me the OPENING REPORT and the first situation based on current news.",
    })) as GenerateContentResponse;
    return parseResponse(response.text);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function submitPlayerMove(move: string): Promise<TurnResponse> {
  if (!chatSession) {
    throw new Error("Game not started");
  }

  try {
    const response = await callWithRetry(() => chatSession.sendMessage({
      message: move,
    })) as GenerateContentResponse;
    return parseResponse(response.text);
  } catch (error: any) {
    return handleApiError(error);
  }
}

function handleApiError(error: any): TurnResponse {
  console.error("API Error:", error);
  let message = "Communication error. The feed was interrupted.";
  
  const errorMessage = error?.message || String(error);
  if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
    message = "⚠️ **SYSTEM OVERLOAD (429 RATE LIMIT)**\n\nThe Headmaster AI is currently overwhelmed with requests. Your API quota has been exceeded. Please wait a moment and try again later, or check your billing details.";
  }

  return {
    message,
    scores: {
      accountability: 0,
      protection: 0,
      systemicReform: 0,
      hotspots: [],
    },
    suggestedActions: [
      "Retry connection to the live feed.",
      "Check local encryption protocols.",
      "Wait for system stabilization."
    ]
  };
}

function parseResponse(text: string | undefined): TurnResponse {
  if (!text) {
    throw new Error("Empty response from AI");
  }

  try {
    // Attempt to parse the raw text as JSON
    // Sometimes the model might still wrap it in markdown blocks
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText) as TurnResponse;
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", text);
    // Fallback response
    return {
      message: text,
      scores: {
        accountability: 50,
        protection: 50,
        systemicReform: 50,
        hotspots: ["MIDDLE_EAST"],
      },
      suggestedActions: [
        "Analyze the current situation further.",
        "Propose a diplomatic solution.",
        "Monitor the hotspots for changes."
      ]
    };
  }
}
