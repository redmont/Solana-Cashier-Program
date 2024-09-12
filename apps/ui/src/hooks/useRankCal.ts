export const ranks = [
  { name: 'White Belt', xp: 1 },
  { name: 'Yellow Belt', xp: 2 },
  { name: 'Orange Belt', xp: 3 },
  { name: 'Green Belt', xp: 6 },
  { name: 'Blue Belt', xp: 10 },
  { name: 'Purple Belt', xp: 19 },
  { name: 'Red Belt', xp: 34 },
  { name: 'Brown Belt', xp: 61 },
  { name: 'Black Belt', xp: 110 },
  { name: 'Iron Brawler', xp: 198 },
  { name: 'Bronze Brawler', xp: 357 },
  { name: 'Silver Brawler', xp: 643 },
  { name: 'Gold Brawler', xp: 1157 },
  { name: 'Platinum Brawler', xp: 2082 },
  { name: 'Diamond Brawler', xp: 3748 },
  { name: 'Master Brawler', xp: 6747 },
  { name: 'Grandmaster Brawler', xp: 12144 },
  { name: 'Legendary Brawler', xp: 21859 },
  { name: 'Epic Brawler', xp: 39346 },
  { name: 'Mythic Brawler', xp: 70824 },
  { name: 'Heroic Brawler', xp: 127482 },
  { name: 'Ethereal Brawler', xp: 229468 },
  { name: 'Celestial Brawler', xp: 413043 },
  { name: 'Abyssal Brawler', xp: 743477 },
  { name: 'Divine Brawler', xp: 1338259 },
  { name: 'Supreme Brawler', xp: 2408866 },
  { name: 'Ultimate Brawler', xp: 4335959 },
  { name: 'Infinite Brawler', xp: 7804726 },
  { name: 'Godlike Brawler', xp: 14048506 },
  { name: 'Omniscient Brawler', xp: 25287311 },
];

export const calculateRankLeaderboard = (xp: number) => {
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (xp >= ranks[i].xp) {
      const nextRank = ranks[i + 1];
      const xpForNextLevel = nextRank ? nextRank.xp - xp : 'Max Level';
      return {
        currentRank: ranks[i].name,
        xpForNextLevel,
        nextRankXp: nextRank?.xp,
      };
    }
  }
  return { currentRank: 'No Rank', nextRankXp: 1 };
};
