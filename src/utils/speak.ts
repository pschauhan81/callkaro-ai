export function speak(text: string, onEnd?: () => void) {
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "hi-IN";
  utterance.rate = 0.95;

  utterance.onend = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}
