export const QUOTES: { text: string; author: string }[] = [
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "It does not matter how slowly you go, so long as you do not stop.", author: "Confucius" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Small deeds done are better than great deeds planned.", author: "Peter Marshall" },
  { text: "What gets measured gets managed.", author: "Peter Drucker" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
];

/** Deterministic per-day pick so the quote changes once a day. */
export function quoteForDay(dayKey: string, offset = 0) {
  let hash = 0;
  for (let i = 0; i < dayKey.length; i++) hash = (hash * 31 + dayKey.charCodeAt(i)) % 100000;
  return QUOTES[(hash + offset) % QUOTES.length];
}
