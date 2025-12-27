import { NextResponse } from "next/server";
import { exec } from "child_process";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { leadName, company, campaignGoal } = await req.json();

    const prompt = `
Tum ek professional Hindi + English sales caller ho.

Lead Name: ${leadName}
Company: ${company}
Goal: ${campaignGoal}

30–40 seconds ka polite calling script likho.
`;

    const dataRaw = await new Promise<string>((resolve, reject) => {
  exec(
    `ollama run llama3:latest "${safePrompt}" --json`,
    (err, stdout, stderr) => {
      if (err) {
        console.error("CLI ERROR:", stderr);
        reject(err);
      } else resolve(stdout);
    }
  );
});


    const data = JSON.parse(dataRaw);

    return NextResponse.json({
      script: data.response || data.output || "Default fallback script",
    });
  } catch (err) {
    console.error("OLLAMA ERROR:", err);
    return NextResponse.json({
      script:
        "Namaste, main CallKaro AI se bol raha hoon. Kya main aapse 30 seconds baat kar sakta hoon?",
    });
  }
}
