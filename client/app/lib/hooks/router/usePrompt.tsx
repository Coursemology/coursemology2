import { useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { unstable_usePrompt } from 'react-router-dom';

import useTranslation from '../useTranslation';

const translations = defineMessages({
  sureYouWantToLeave: {
    id: 'lib.hooks.router.usePrompt.sureYouWantToLeave',
    defaultMessage:
      'Are you sure you want to leave this page? You will lose unsaved changes.',
  },
});

/**
 * `window.onbeforeunload` will block page unload if this handler returns a string.
 * Since the spec has disallowed custom messages, the returned string can be anything.
 *
 * @see https://chromestatus.com/feature/5349061406228480
 */
const blocker: OnBeforeUnloadEventHandler = (e) => {
  e.preventDefault();
  return 'null';
};

/**
 * Prompts the user before navigating away from the current page if `when` is `true`.
 *
 * There is no need to allow customising messages since `window.onbeforeunload`
 * disallows custom messages. Even if `unstable_usePrompt` allows customisable
 * messages, this means that this message is never guaranteed to appear, so no point
 * in allowing it here anyway.
 */
const usePrompt = (when = true): void => {
  const { t } = useTranslation();

  // `unstable_usePrompt` doesn't block the page when the user closes the tab/window,
  // refreshes the page, or changes the URL manually. We need to use `window.onbeforeunload`
  // to block for these cases.
  //
  // We can no longer do this with `navigator.block` as of React Router 6.4.0.
  // See https://github.com/remix-run/react-router/issues/8139#issuecomment-1262630360
  useEffect(() => {
    if (when) window.onbeforeunload = blocker;

    return () => {
      window.onbeforeunload = null;
    };
  }, [when]);

  return unstable_usePrompt({
    when,
    message: t(translations.sureYouWantToLeave),
  });
};

export default usePrompt;
