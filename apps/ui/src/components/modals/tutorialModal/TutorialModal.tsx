import { FC, useCallback, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from '@/components/ui/button';
import { Carousel } from 'primereact/carousel';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

import { TutorialSlide } from './TutorialSlide';
import { slides } from './slides';
import { useAtom } from 'jotai';
import { tutorialCompletedAtom } from '@/store/view';

export const TutorialModal: FC = () => {
  const [tutorialCompleted, setTutorialCompleted] = useAtom(
    tutorialCompletedAtom,
  );

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
    setTutorialCompleted('yes');
  }, [setTutorialCompleted]);

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
      visible={tutorialCompleted === 'no'}
      onHide={dismiss}
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
            <Button variant="ghost" onClick={goBack}>
              Back
            </Button>
          )}

          {!isLastSlide && (
            <Button variant="outline" onClick={goNext}>
              Next
            </Button>
          )}

          {isLastSlide && (
            <Button variant="outline" onClick={complete}>
              Let's Go!
            </Button>
          )}
        </div>

        <Button variant="ghost" onClick={dismiss}>
          I know all of this
        </Button>
      </div>
    </Dialog>
  );
};
