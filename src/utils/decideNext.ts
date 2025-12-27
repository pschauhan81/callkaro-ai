export function decideNext(userText: string) {
  const text = userText.toLowerCase();

  if (text.includes("yes") || text.includes("interested")) {
    return "Interested";
  }

  if (text.includes("later") || text.includes("callback")) {
    return "Call back later";
  }

  if (text.includes("no") || text.includes("not interested")) {
    return "Not interested";
  }

  return "Unclear";
}

