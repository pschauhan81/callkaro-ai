"use client";

import { useState } from "react";
import { speak } from "@/utils/speak";
import { listen } from "@/utils/listen";
import { classifyWithAI } from "@/utils/classifyWithAI";
import { getFollowUpPrompt } from "@/utils/followUpScript";
import { generateMockScript } from "@/utils/mockScript";

export default function CallButton({
  leadName,
  company,
}: {
  leadName: string;
  company: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "calling" | "completed"
  >("idle");
  const [userResponse, setUserResponse] = useState("");
  const [followUpText, setFollowUpText] = useState("");

  const startCall = async () => {
    const script = generateMockScript(leadName, company);
    setStatus("calling");

    // 🔊 AI first message
    speak(script, () => {
      // 🎙 Listen to user
      listen(async (userText) => {
        // 🧠 1. Classify with Ollama
        const category = await classifyWithAI(userText);
        setUserResponse(category);

        // 🧠 2. Prepare follow-up prompt
        const followPrompt = getFollowUpPrompt(
          category,
          leadName,
          company
        );

        // 🤖 3. Ask Ollama for follow-up line
        const res = await fetch("/api/ai/followup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: followPrompt }),
        });

        const data = await res.json();
        const followUp =
          data.text || "Thank you for your time.";

        setFollowUpText(followUp);

        // 🔊 4. Speak follow-up
        speak(followUp);

        // 💾 5. Save everything
        await fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadName,
            company,
            script,
            status: "completed",
            response: category,
            follow_up: followUp,
          }),
        });

        setStatus("completed");
      });
    });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={startCall}
        disabled={status === "calling"}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
      >
        {status === "calling" ? "📞 Calling..." : "📞 Start Call"}
      </button>

      {userResponse && (
        <p className="text-sm">
          User Intent: <b>{userResponse}</b>
        </p>
      )}

      {followUpText && (
        <p className="text-sm text-gray-600">
          AI Follow-up: <b>{followUpText}</b>
        </p>
      )}
    </div>
  );
}
