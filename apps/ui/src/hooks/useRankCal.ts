export const ranks = [
  { name: 'White Belt', image: '1_white_belt.png', xp: 0 },
  { name: 'Yellow Belt', image: '2_yellow_belt.png', xp: 2 },
  { name: 'Orange Belt', image: '3_orange_belt.png', xp: 3 },
  { name: 'Green Belt', image: '4_green_belt.png', xp: 6 },
  { name: 'Blue Belt', image: '5_blue_belt.png', xp: 10 },
  { name: 'Purple Belt', image: '6_purple_belt.png', xp: 19 },
  { name: 'Red Belt', image: '7_red_belt.png', xp: 34 },
  { name: 'Brown Belt', image: '8_brown_belt.png', xp: 61 },
  { name: 'Black Belt', image: '9_black_belt.png', xp: 110 },
  { name: 'Iron Brawler', image: '10_iron_brawler.png', xp: 198 },
  { name: 'Bronze Brawler', image: '11_bronze_brawler.png', xp: 357 },
  { name: 'Silver Brawler', image: '12_silver_brawler.png', xp: 643 },
  { name: 'Gold Brawler', image: '13_gold_brawler.png', xp: 1157 },
  { name: 'Platinum Brawler', image: '14_platinum_brawler.png', xp: 2082 },
  { name: 'Diamond Brawler', image: '15_diamond_brawler.png', xp: 3748 },
  { name: 'Master Brawler', image: '16_master_brawler.png', xp: 6747 },
  {
    name: 'Grandmaster Brawler',
    image: '17_grandmaster_brawler.png',
    xp: 12144,
  },
  { name: 'Legendary Brawler', image: '18_legendary_brawler.png', xp: 21859 },
  { name: 'Epic Brawler', image: '19_epic_brawler.png', xp: 39346 },
  { name: 'Mythic Brawler', image: '20_mythic_brawler.png', xp: 70824 },
  { name: 'Heroic Brawler', image: '21_heroic_brawler.png', xp: 127482 },
  { name: 'Ethereal Brawler', image: '22_ethereal_brawler.png', xp: 229468 },
  { name: 'Celestial Brawler', image: '23_celestial_brawler.png', xp: 413043 },
  { name: 'Abyssal Brawler', image: '24_abyssal_brawler.png', xp: 743477 },
  { name: 'Divine Brawler', image: '25_divine_brawler.png', xp: 1338259 },
  { name: 'Supreme Brawler', image: '26_supreme_brawler.png', xp: 2408866 },
  { name: 'Ultimate Brawler', image: '27_ultimate_brawler.png', xp: 4335959 },
  { name: 'Infinite Brawler', image: '28_infinite_brawler.png', xp: 7804726 },
  { name: 'Godlike Brawler', image: '29_godlike_brawler.png', xp: 14048506 },
  {
    name: 'Omniscient Brawler',
    image: '30_omniscient_brawler.png',
    xp: 25287311,
  },
];

export const calculateRankLeaderboard = (xp: number) => {
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (xp >= ranks[i].xp) {
      const nextRank = ranks[i + 1];
      const xpForNextLevel = nextRank ? nextRank.xp - xp : 'Max Level';
      return {
        currentRank: ranks[i].name,
        currentRankImage: ranks[i].image,
        xpForNextLevel,
        nextRankXp: nextRank?.xp,
      };
    }
  }

  const nextRank = ranks[1];
  const xpForNextLevel = nextRank.xp - xp;
  return {
    currentRank: 'White Belt',
    currentRankImage: ranks[0].image,
    xpForNextLevel,
    nextRankXp: nextRank.xp,
  };
};
