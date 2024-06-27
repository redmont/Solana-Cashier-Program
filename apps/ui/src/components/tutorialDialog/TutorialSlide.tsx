import { classNames } from 'primereact/utils';
import { FC, ReactNode } from 'react';

export interface TutorialSlideProps {
  title?: string;
  text: ReactNode;
  id?: string;
}

export const TutorialSlide: FC<TutorialSlideProps> = (props) => (
  <div id={props.id} className="slide">
    <div
      className={classNames('slide-header', {
        'no-title': !props.title,
      })}
    >
      {props.title && <div className="slide-title">{props.title}</div>}

      <div id={`${props.id}-image`} className="slide-image"></div>
    </div>

    <p className="slide-text">{props.text}</p>
  </div>
);
