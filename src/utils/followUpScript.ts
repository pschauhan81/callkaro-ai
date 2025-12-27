export function getFollowUpPrompt(
  category: string,
  leadName: string,
  company: string
) {
  if (category === "Interested") {
    return `Great! Ask ${leadName} ji a suitable time for a detailed demo of ${company}. Keep it short.`;
  }
  if (category === "Call back later") {
    return `Politely ask ${leadName} ji for a preferred callback time. One sentence.`;
  }
  if (category === "Not interested") {
    return `Thank ${leadName} ji politely and end the call in one sentence.`;
  }
  return `Politely clarify if this is the right number for ${leadName} ji.`;
}
