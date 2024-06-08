import { FC } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export interface WelcomeDialogProps {
  visible: boolean;
  onHide: () => void;
}

export const WelcomeDialog: FC<WelcomeDialogProps> = (props) => {
  return (
    <Dialog
      className="welcome-dialog"
      closable={false}
      blockScroll
      showHeader={false}
      draggable={false}
      visible={props.visible}
      onHide={props.onHide}
    >
      <div className="dialog-body">
        <div className="slide slide-1">
          <div className="slide-image-box">
            <img src="/welcome.png" />
          </div>

          <p className="slide-text">
            Be the first to brawl your way to glory.
            <br /> Welcome to the BRAWL3RS alpha version.
          </p>
        </div>
        {/* <div className="slide slide-2">
        <div className="slide-title">Join the Fight</div>
        <div className="slide-image-container">
          <img className="slide-image" src="/connect.png" />
        </div>
        <p className="slide-text">
          Get 1,000 free credits to start Brawling! Login using your email,
          google, or web3 wallet.
        </p>
      </div> */}
        {/* <div className="slide slide-3">
        <div className="slide-title">Choose your Brawler(s)</div>
        <div className="slide-image-container">
          <img className="slide-image" src="/brawlers.png" />
        </div>
        <p className="slide-text">
          Select the Brawler you think will win! <br />
          The winner is the real-time coin price with the biggest gain!
        </p>
      </div> */}
        {/* <div className="slide slide-4">
          <div className="slide-title">Place your Stake(s)</div>
          <div className="slide-image-container">
            <img className="slide-image" src="/stakes.png" />
          </div>
          <p className="slide-text">
            Decide how many credits to stake on your chosen fighter.
            <br />
            You can place multiple stakes on either side.
          </p>
        </div> */}
      </div>

      <div className="dialog-footer">
        <div className="dialog-footer-start"></div>
        <Button size="large" className="p-button-secondary p-button-outlined">
          Next
        </Button>
      </div>
    </Dialog>
  );
};
