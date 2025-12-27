export function getMockResponse() {
  const responses = [
    "Interested",
    "Call back later",
    "Not interested",
    "Wrong number",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
