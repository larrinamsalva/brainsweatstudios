export interface FlagshipAdventure {
  role: string;
  hook: string;
  beats: readonly [string, string, string];
  celebration: string;
  nextId: string;
  nextLabel: string;
  nextReason: string;
}

export const flagshipAdventures: Partial<Record<string, FlagshipAdventure>> = {
  money: {
    role: 'Money Captain',
    hook: 'Make the plan, survive the surprises, and finish the month stronger than you started.',
    beats: ['Build your plan', 'Handle the surprise', 'Protect your cushion'],
    celebration: 'You made real choices with pretend money — and your plan made it through the month.',
    nextId: 'hustle',
    nextLabel: 'Side Hustle Simulator',
    nextReason: 'Now try earning the money yourself: pick a tiny business, set a price, and see if customers come.',
  },
  hustle: {
    role: 'Tiny Business Boss',
    hook: 'Pick the work, set the price, serve people well, and find out what profit really means.',
    beats: ['Choose your hustle', 'Run the day', 'Grow your reputation'],
    celebration: 'Your tiny business made it through the workweek. Revenue, costs, customers — you juggled the whole thing.',
    nextId: 'career',
    nextLabel: 'Career Forge',
    nextReason: 'Take those work skills into a first-job adventure with schedules, interviews, and real communication choices.',
  },
  scam: {
    role: 'Scam Detective',
    hook: 'Slow the message down, hunt for clues, and decide what deserves trust before anybody clicks.',
    beats: ['Inspect the message', 'Mark the clues', 'Make the call'],
    celebration: 'Case closed. You used evidence instead of pressure, panic, or a familiar-looking name.',
    nextId: 'media',
    nextLabel: 'Media Detective',
    nextReason: 'Keep your detective hat on and investigate whether a viral claim actually holds up.',
  },
  fix: {
    role: 'Workshop Troubleshooter',
    hook: 'Inspect first, measure twice, choose the right approach, and let the model tell you what worked.',
    beats: ['Find the problem', 'Measure & choose', 'Test the fix'],
    celebration: 'Workshop win. You diagnosed before acting and used the test result to prove the solution.',
    nextId: 'electric',
    nextLabel: 'Circuit Workshop',
    nextReason: 'Ready for a harder build? Move into protected virtual circuits, measurements, and electrical reasoning.',
  },
  code: {
    role: 'Robot Programmer',
    hook: 'Write a route, watch the robot try it, learn from the crash, and debug your way to the star.',
    beats: ['Build the program', 'Run the robot', 'Debug & improve'],
    celebration: 'Your robot reached the goal because you kept testing the idea instead of guessing once and quitting.',
    nextId: 'robot',
    nextLabel: 'Robot Foundry',
    nextReason: 'Take the next step: build the virtual hardware too, then program the controller that runs it.',
  },
};
