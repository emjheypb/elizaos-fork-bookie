export const getRandomOpeningPhrase = () => {
  const openings = [
    "Alright, let's talk numbers and see what we're working with.",
    "Here's the deal - let me break down the market for you.",
    "Listen up, I've got some solid intel on this play.",
    "Time to get serious - here's what the smart money is doing.",
    "Let me give you the straight dope on this opportunity.",
    "Pay attention - this is where the value might be hiding.",
    "Buckle up, we're diving into some market analysis here.",
    "Hold on, let me pull up the data you need to see.",
    "Here's what separates the pros from the amateurs.",
    "Alright, let's cut through the noise and focus on facts."
  ];
  return openings[Math.floor(Math.random() * openings.length)];
};

export const getRandomClosingPhrase = () => {
  const closings = [
    "Remember - discipline beats luck every single time.",
    "That's how you separate emotion from strategy.",
    "Keep your head cool and your bankroll management tight.",
    "The house edge is real, but smart traders find their spots.",
    "Never chase losses - stick to your system and trust the process.",
    "Risk management isn't sexy, but it's what keeps you in the game.",
    "The market doesn't care about your feelings - only your analysis matters.",
    "Position sizing is everything - don't let greed cloud your judgment.",
    "Sharp money moves quiet, dumb money moves loud.",
    "Stay disciplined, stay profitable, and always know your exit strategy.",
    "The best bet you never made is often better than the worst one you did.",
    "Markets are efficient until they're not - that's where we make our money."
  ];
  return closings[Math.floor(Math.random() * closings.length)];
};

export const getRandomRiskWarning = () => {
  const warnings = [
    "Don't risk more than 2-5% of your bankroll on this.",
    "Size your position appropriately - this isn't a lottery ticket.",
    "Make sure this fits your overall risk management strategy.",
    "Only bet what you can afford to lose completely.",
    "Remember, even 'sure things' can go sideways fast.",
    "Check your bankroll allocation before pulling the trigger.",
    "This is real money - treat it with the respect it deserves."
  ];
  return warnings[Math.floor(Math.random() * warnings.length)];
};

export const getRandomMarketInsight = () => {
  const insights = [
    "The line movement tells a story - make sure you're reading it right.",
    "Public sentiment can create value on the other side.",
    "Look for spots where the market has overreacted to recent news.",
    "Sometimes the best play is no play at all.",
    "Sharp money usually comes in late and moves the line.",
    "Volume and liquidity matter more than most people think.",
    "Contrarian plays can be profitable if your analysis is solid.",
    "The vig is your biggest enemy - shop around for the best odds."
  ];
  return insights[Math.floor(Math.random() * insights.length)];
};

export const commonWords = [
  'find', 'show', 'get', 'check', 'what', 'whats', 'tell', 'me', 'see', 'look', 'at',
  'display', 'list', 'view', 'search', 'for', 'kalshi', 'trades', 'trade', 'markets',
  'market', 'bets', 'bet', 'betting', 'opportunities', 'wager', 'odds', 'available',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'among', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'can', 'any', 'some', 'all', 'no', 'not', 'only', 'own',
  'other', 'such', 'than', 'too', 'very', 'just', 'now', 'here', 'there', 'where',
  'how', 'why', 'when', 'who', 'which', 'what', 'that', 'this', 'these', 'those',
];

export const symbols = [
  '?', '!', '.', ',', ';', ':', '-', '_', '=', '+', '*', '/', '\\', '|', '~', '`',
  '"', "'", '(', ')', '[', ']', '{', '}', '@', '#', '$', '%', '^', '&', '>', '<',
]

export const marketCategories = [
  'politics', 'sports', 'crypto', 'economics', 'mentions', 'companies', 'financials',
  'science and technology', 'health', 'world',
]

export const removeCommonWords = (text: string): string[] => {
  return text.split(/\s+/).filter(
    (word) => word.length > 2 && !commonWords.includes(word) && !/^\d+$/.test(word) // Remove pure numbers
  );
};

export const removeSymbols = (text: string): string => {
  return text.split('').filter(char => !symbols.includes(char)).join('');
}