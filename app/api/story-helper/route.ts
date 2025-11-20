import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error("GROQ_API_KEY is not set in the environment.");
}

const client = new Groq({ apiKey });

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { genre, characters, idea } = body || {};

    if (!genre || !characters || !idea) {
      return NextResponse.json(
        { error: "Missing required fields: genre, characters, idea." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert comic writer assistant.

Given:
- Genre: ${genre}
- Main characters: ${characters}
- Core idea: ${idea}

Generate:
1. A short one-paragraph synopsis of the comic.
2. A numbered 10-panel outline. For each panel, include:
   - Panel number
   - What is happening visually
   - One or two lines of possible dialogue.

Format clearly using headings like:
"SYNOPSIS:" and "PANELS:"
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
    });

    const content =
      completion.choices[0]?.message?.content || "No content generated.";

    return NextResponse.json({ content }, { status: 200 });
  } catch (err: any) {
    console.error("Error in story-helper API route (Groq):", err);

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to generate story helper content. Check server logs for details.",
      },
      { status: 500 }
    );
  }
}

