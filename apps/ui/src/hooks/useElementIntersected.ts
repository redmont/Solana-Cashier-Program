import { useEffect, useState } from 'react';

const useElementInView = <T extends HTMLElement | null>(
  element: T,
  options?: IntersectionObserverInit,
) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsInView(entry.isIntersecting);
    }, options);

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [element, options]);

  return isInView;
};

export default useElementInView;
