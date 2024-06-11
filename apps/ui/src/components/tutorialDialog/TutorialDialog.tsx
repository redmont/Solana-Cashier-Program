import { FC, useCallback, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { classNames } from 'primereact/utils';

import { TutorialSlide } from './TutorialSlide';
import { slides } from './slides';

export interface TutorialDialogProps {
  visible: boolean;
  onHide: () => void;
}

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
          itemTemplate={TutorialSlide}
          onPageChange={({ page }) => setSlideNum(page)}
        />
      </div>

      <div className="dialog-footer">
        <div className="dialog-nav">
          {slideNum > 0 && (
            <Button
              icon="pi pi-arrow-left"
              label="Back"
              className="button-back p-button-secondary p-button-outlined border-none"
              onClick={goBack}
            ></Button>
          )}

          {!isLastSlide && (
            <Button
              icon="pi pi-arrow-right"
              iconPos="right"
              label="Next"
              className="button-next p-button-secondary p-button-outlined"
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

        <Button
          className={classNames(
            'button-complete p-button-secondary p-button-outlined border-none text-400',
          )}
          label="I know all of this"
          onClick={dismiss}
        />
      </div>
    </Dialog>
  );
};
