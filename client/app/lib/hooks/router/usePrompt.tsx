import { History, Transition } from 'history';
import { useCallback, useContext, useEffect } from 'react';
import {
  UNSAFE_NavigationContext as NavigationContext,
  Navigator,
} from 'react-router-dom';

type ExtendNavigator = Navigator & Pick<History, 'block'>;

export const useBlocker = (
  blocker: (tx: Transition) => void,
  when = true,
): void => {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) return undefined;

    const unblock = (navigator as ExtendNavigator).block((tx) => {
      const autoUnblockingTx = {
        ...tx,
        retry(): void {
          unblock();
          tx.retry();
        },
      };

      blocker(autoUnblockingTx);
    });

    return unblock;
  }, [navigator, blocker, when]);
};

export const usePrompt = (when = true): void => {
  const blocker = useCallback((tx: Transition) => {
    // eslint-disable-next-line no-alert
    if (window.confirm()) tx.retry();
  }, []);

  useBlocker(blocker, when);
};

export default usePrompt;
