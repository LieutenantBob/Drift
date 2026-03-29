export const prompts: readonly string[] = [
  "What are you halfway through deciding?",
  "Name something you understand now that you didn't a year ago.",
  "What is the conversation you keep not having?",
  "What would you do differently if you knew it would work?",
  "What are you carrying that isn't yours to carry?",
  "What do you keep meaning to say?",
  "What are you almost ready for?",
  "What does 'enough' look like right now?",
  "What are you pretending not to know?",
  "Where are you being too careful?",
  "What would you do if you weren't afraid of wasting time?",
  "What have you been meaning to finish?",
  "What are you avoiding by staying busy?",
  "What do you want to want?",
  "What would you tell yourself six months ago?",
  "What is the thing you already know but haven't accepted yet?",
  "What are you waiting for permission to do?",
  "What have you outgrown?",
  "What are you most uncertain about right now?",
  "What would it mean to actually rest?",
  "What do you keep starting over?",
  "What has surprised you about yourself lately?",
  "What are you trying to solve that might not be a problem?",
  "What would you stop doing if you stopped being afraid?",
  "What do you owe yourself?",
  "What are you more ready for than you think?",
  "What has been trying to get your attention?",
  "What does the next version of this look like?",
  "What are you making harder than it needs to be?",
  "What would you begin if you knew you wouldn't fail?",
] as const;

export function getDailyPrompt(): string {
  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  return prompts[daysSinceEpoch % prompts.length];
}
