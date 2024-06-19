import { FC, ReactNode } from 'react';

export interface TutorialSlideProps {
  title?: string;
  image: string;
  text: ReactNode;
  id?: string;
}

export const TutorialSlide: FC<TutorialSlideProps> = (props) => (
  <div id={props.id} className="slide">
    {props.title && <div className="slide-title">{props.title}</div>}

    <div className="slide-image-box">
      <img src={props.image} />
    </div>

    <p className="slide-text">{props.text}</p>
  </div>
);
