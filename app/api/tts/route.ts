import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Received POST request to /api/tts");
    const body = await req.json();
    console.log("Request body:", body);
    const { text } = body;
    if (!text) {
      console.error("No text provided in request body");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Check text length (max 32,000 tokens for Gemini TTS)
    if (text.length > 32000) {
      console.error("Text exceeds maximum length of 32,000 characters");
      return NextResponse.json(
        { error: "Text exceeds maximum length" },
        { status: 400 }
      );
    }

    console.log(
      "Sending request to AvalAI TTS API with text length:",
      text.length
    );
    const response = await fetch("https://api.avalai.ir/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AVALAI_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash-preview-tts", // Gemini TTS model
        input: text,
        voice: {
          name: "Kore", // Supported Gemini TTS voice
          languageCode: "en-US", // Fallback language (fa-IR unsupported)
        },
        response_format: "mp3", // Browser-compatible format
        speed: 1.0,
      }),
    });

    console.log(
      "AvalAI API response status:",
      response.status,
      response.statusText
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("AvalAI API error:", JSON.stringify(errorData, null, 2));
      throw new Error(
        `AvalAI API request failed: ${response.status} ${response.statusText}`
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("Audio buffer received, size:", audioBuffer.byteLength);

    // Return the audio buffer with appropriate headers
    console.log("Returning audio response with Content-Type: audio/mp3");
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mp3",
      },
    });
  } catch (error) {
    console.error("Error in TTS API:", error);
    return NextResponse.json(
      {
        error: "Failed to generate audio",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
