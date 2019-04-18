import { useEffect, createRef } from 'react';

const stopPropagationAndUseHandler = (handler: EventListener): EventListener => e => {
  e.stopImmediatePropagation();
  handler(e);
}

export const useNativeEvent = (type: string, handler: EventListener) => {
  const ref: React.RefObject<any> = createRef();

  useEffect(
    () => {
      if (ref.current) {
        ref.current.addEventListener(type, stopPropagationAndUseHandler(handler), true);
      }
    },
    [ref]
  );

  return ref;
};
