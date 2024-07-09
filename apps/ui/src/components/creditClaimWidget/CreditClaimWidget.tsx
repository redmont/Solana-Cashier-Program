import { FC } from 'react';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

export const CreditClaimWidget: FC = () => {
  return (
    <div className="widget credit-claim-widget">
      <div className="widget-header">
        <div className="widget-title">Daily Credits Claim</div>
        {/* <p className="widget-info">
          If you don't claim a day, your streak resets to day 1.
        </p> */}
      </div>
      <div className="widget-body">
        <CreditClaimCard claimed />
        <CreditClaimCard claimed />
        <CreditClaimCard expiry />
        <CreditClaimCard />
        <CreditClaimCard />
      </div>
    </div>
  );
};

interface CreditClaimCard {
  claimed?: boolean;
  large?: boolean;
  expiry?: boolean;
}

const CreditClaimCard: FC<CreditClaimCard> = (props) => {
  return (
    <div
      className={classNames('credit-claim-card', {
        claimed: props.claimed,
        current: props.expiry,
      })}
    >
      <div className="claim-day">05/03</div>

      <div className="claim-xp">+1250</div>

      {props.expiry && (
        <div className="claim-expiry">
          Expires in
          <br />
          12h 24m
        </div>
      )}

      {props.claimed && <span className="claimed-label">Claimed</span>}

      {!props.claimed && <Button className="claim-button" label="Claim" />}
    </div>
  );
};
