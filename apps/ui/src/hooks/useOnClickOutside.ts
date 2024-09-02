import { useEffect, RefObject } from 'react';

const useOnClickOutside = <T extends HTMLElement>(
  ref: RefObject<T> | RefObject<T>[],
  handler: (event: MouseEvent | TouchEvent) => void,
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const eventTarget = event.target as Node;

      if (
        // dropdowns use portals, so we just exclude them so they dont trigger outside click
        (event.target as HTMLElement)?.closest('[role="menu"]') ||
        // we want to be able to clear alerts without emitting outside click
        (event.target as HTMLElement)?.closest('[role="status"]')
      ) {
        return;
      }

      if (Array.isArray(ref)) {
        for (const refItem of ref) {
          if (!refItem.current || refItem.current.contains(eventTarget)) {
            return;
          }
        }
      } else if (!ref.current || ref.current.contains(eventTarget)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export default useOnClickOutside;
