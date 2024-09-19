import { TutorialSlideProps } from './TutorialSlide';

export const slides: TutorialSlideProps[] = [
  {
    id: 'connect-slide',
    title: 'Every Fight Wins Crypto',
    text: 'Select your fighter. Place your stakes. Win big.',
  },
  {
    id: 'brawlers-slide',
    title: 'Back Your BRAWL3R',
    text: (
      <>
        Every Brawl3r is tied to its own asset price. <br />
        The best price move in a 10 second period wins!
      </>
    ),
  },
  {
    id: 'stakes-slide',
    title: 'Cash Out Anytime',
    text: 'Deposit and withdraw crypto to purchase and redeem in-game BRAWL3Rs Credits',
  },
  {
    id: 'win-slide',
    title: 'Earn XP for Bonus Prizes',
    text: (
      <>
        1 XP = 10,000 Credits Staked. <br />
        Earn XP for chances to win prizes like OMB #3564
      </>
    ),
  },
];
