import { useEffect, createRef } from 'react';

export const useNativeEvent = (type: string, handler: EventListenerOrEventListenerObject) => {
  const ref: React.RefObject<any> = createRef();

  useEffect(
    () => {
      if (ref.current) {
        ref.current.addEventListener(type, handler, true);
      }

      return () => {
        if (ref.current) {
          ref.current.removeEventListener(type, handler);
        }
      }
    },
    [ref]
  );

  return ref;
};
