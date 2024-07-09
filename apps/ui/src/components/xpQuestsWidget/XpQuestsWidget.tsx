import { FC } from 'react';

export const XpQuestsWidget = () => {
  return (
    <div className="widget xp-quests-widget">
      <div className="widget-header">Get More XP</div>

      <div className="widget-body">
        <XpQuestTile icon="envelope" title="Verify your Email" xp={100} />
        <XpQuestTile icon="twitter" title="Subscribe on Twitter" xp={50} />
      </div>
    </div>
  );
};

interface XpQuestTileProps {
  icon: string;
  title: string;
  xp: number;
}

const XpQuestTile: FC<XpQuestTileProps> = (props) => {
  return (
    <a
      className="xp-quest-tile"
      href="https://zealy.io/cw/brawl3rs/questboard"
      target="_blank"
    >
      <div className="xp-quest-tile-head">
        <i className={`pi pi-${props.icon}`} />
      </div>
      <div className="xp-quest-tile-body">
        <div className="xp-quest-tile-title">{props.title}</div>
        <div className="xp-quest-tile-xp">+{props.xp} XP</div>
      </div>
      <div className="xp-quest-tile-tail">
        <i className={`pi pi-arrow-right`} />
      </div>
    </a>
  );
};
