import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const prompt = `
User said:
"${text}"

Classify the intent into ONLY one of the following words:
- Interested
- Call back later
- Not interested
- Wrong number

Reply with only one word.
`;

    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false,
      }),
    });

    const data = await res.json();

    const answer = data.response?.trim();

    return NextResponse.json({ result: answer });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
