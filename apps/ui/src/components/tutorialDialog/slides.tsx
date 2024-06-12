import { TutorialSlideProps } from './TutorialSlide';

export const slides: TutorialSlideProps[] = [
  {
    id: 'intro-slide',
    image: '/tutorial/welcome.png',
    text: (
      <>
        Be the first to brawl your way to glory.
        <br /> Welcome to the BRAWL3RS alpha version.
      </>
    ),
  },
  {
    id: 'connect-slide',
    title: 'Join the Fight',
    image: '/tutorial/connect.png',
    text: 'Get 1,000 free credits to start Brawling! Login using your email, google, or web3 wallet.',
  },
  {
    id: 'brawlers-slide',
    title: 'Choose your Brawler(s)',
    image: '/tutorial/brawlers.png',
    text: (
      <>
        Select the Brawler you think will win! <br />
        The winner is the real-time coin price with the biggest gain!
      </>
    ),
  },
  {
    id: 'stakes-slide',
    title: 'Place your Stake(s)',
    image: '/tutorial/stakes.png',
    text: (
      <>
        Decide how many credits to stake on your chosen fighter.
        <br />
        You can place multiple stakes on either side.
      </>
    ),
  },
  {
    id: 'win-slide',
    title: 'Watch and win big!',
    image: '/tutorial/win.png',
    text: (
      <>
        Winning stakes share the total pool of credits from their losing
        opponent.
        <br />
        Share your win on X or stake again!
      </>
    ),
  },
  {
    id: 'leaderboard-slide',
    title: 'Climb the Leaderboard',
    image: '/tutorial/leaderboard.png',
    text: (
      <>
        Compete in the latest tournament to win real crypto prizes.
        <br />
        Stay on top to earn rewards.
      </>
    ),
  },
  {
    id: 'community-slide',
    title: 'Shape the BRAWL3Rs future',
    image: '/tutorial/community.png',
    text: (
      <>
        Join our community on Discord to share your feedback and shape our
        direction. Get ready to play with real crypto credits and more coming
        soon. LFB!
      </>
    ),
  },
];
