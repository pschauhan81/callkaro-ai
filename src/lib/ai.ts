import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCallSummary(transcript: string) {
  const prompt = `
  Summarize the following call transcript in 2-3 sentences:
  ${transcript}
  `;

  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices?.[0]?.message?.content || "";
}
