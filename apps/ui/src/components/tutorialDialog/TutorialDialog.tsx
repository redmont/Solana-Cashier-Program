import { FC, ReactNode, useCallback, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export interface TutorialDialogProps {
  visible: boolean;
  onHide: () => void;
}

const slides: TutorialSlideProps[] = [
  {
    id: 'intro-slide',
    image: '/welcome.png',
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
    image: '/connect.png',
    text: 'Get 1,000 free credits to start Brawling! Login using your email, google, or web3 wallet.',
  },
  {
    id: 'brawlers-slide',
    title: 'Choose your Brawler(s)',
    image: '/brawlers.png',
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
    image: '/stakes.png',
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
    image: '/win.png',
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
    image: '/leaderboard.png',
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
    image: '/community.png',
    text: (
      <>
        Join our community on Discord to share your feedback and shape our
        direction. Get ready to play with real crypto credits and more coming
        soon. LFB!
      </>
    ),
  },
];

export function completeTutorial() {
  localStorage.setItem('tutorial_complete', 'yes');
}

export function shouldShowTutorial() {
  return !localStorage.getItem('tutorial_complete');
}

export const TutorialDialog: FC<TutorialDialogProps> = ({
  onHide,
  ...props
}) => {
  const [slideNum, setSlideNum] = useState(0);
  const { setShowAuthFlow } = useDynamicContext();

  const goNext = useCallback(() => {
    const nextSlide = Math.min(slideNum + 1, slides.length - 1);

    setSlideNum(nextSlide);
  }, [slideNum]);

  const goBack = useCallback(() => {
    const prevSlide = Math.max(slideNum - 1, 0);

    setSlideNum(prevSlide);
  }, [slideNum]);

  const dismiss = useCallback(() => {
    completeTutorial();
    onHide?.();
  }, [onHide]);

  const complete = useCallback(() => {
    dismiss();
    setShowAuthFlow(true);
  }, [dismiss, setShowAuthFlow]);

  const isLastSlide = slideNum === slides.length - 1;

  return (
    <Dialog
      className="welcome-dialog"
      closable={false}
      blockScroll
      showHeader={false}
      draggable={false}
      visible={props.visible}
      onHide={onHide}
    >
      <div className="dialog-body">
        <Carousel
          page={slideNum}
          numVisible={1}
          showNavigators={false}
          value={slides}
          itemTemplate={WelcomeDialogSlide}
          onPageChange={({ page }) => setSlideNum(page)}
        />
      </div>

      <div className="dialog-footer">
        <div className="dialog-footer-start">
          {!isLastSlide && (
            <Button
              className="p-button-secondary p-button-outlined border-none text-400"
              label="I know all of this"
              onClick={dismiss}
            />
          )}
        </div>

        {slideNum > 0 && (
          <Button
            icon="pi pi-arrow-left"
            label="Back"
            className="p-button-secondary p-button-outlined border-none"
            onClick={goBack}
          ></Button>
        )}

        {!isLastSlide && (
          <Button
            icon="pi pi-arrow-right"
            iconPos="right"
            label="Next"
            className="p-button-secondary p-button-outlined"
            onClick={goNext}
          ></Button>
        )}

        {isLastSlide && (
          <Button
            label="Let's Go!"
            className="p-button-secondary p-button-outlined"
            onClick={complete}
          ></Button>
        )}
      </div>
    </Dialog>
  );
};

interface TutorialSlideProps {
  title?: string;
  image: string;
  text: ReactNode;
  id?: string;
}

const WelcomeDialogSlide: FC<TutorialSlideProps> = (props) => (
  <div id={props.id} className="slide">
    {props.title && <div className="slide-title">{props.title}</div>}

    <div className="slide-image-box">
      <img src={props.image} />
    </div>

    <p className="slide-text">{props.text}</p>
  </div>
);
