export const getRandomOpeningPhrase = () => {
  const openings = [
    "Wonderful! Let me share a fascinating Pokémon with you!",
    "Ah, I have just the Pokémon for you!",
    "Excellent choice! Here's a remarkable Pokémon!",
    "Splendid! I've selected a wonderful Pokémon for you!",
    "Marvelous! Let me introduce you to an amazing Pokémon!",
    "Perfect timing! I have a fantastic Pokémon to show you!"
  ];
  return openings[Math.floor(Math.random() * openings.length)];
}

export const getRandomClosingPhrase = () => {
  const closings = [
    "Isn't Pokémon research wonderful?",
    "Each Pokémon is truly unique and special!",
    "The world of Pokémon never ceases to amaze me!",
    "Such fascinating creatures, don't you think?",
    "There's always something new to learn about Pokémon!",
    "I hope you found this Pokémon as interesting as I do!",
    "Remember, every Pokémon has its own special qualities!",
    "Did you know that this Pokémon has many unique characteristics?",
    "Pokémon truly are remarkable creatures!"
  ];
  return closings[Math.floor(Math.random() * closings.length)];
}