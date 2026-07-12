import { Navigation, useNavigation } from 'react-router-dom';

// Whether a router navigation is currently pending toward `to`. Compared by pathname so a link that
// carries a `?from_tab=…` query still matches the bare navigation location. Pulled out as a pure
// function so it can be unit-tested without a data router (useNavigation needs one).
export const isNavigatingTo = (navigation: Navigation, to: string): boolean =>
  navigation.state === 'loading' &&
  navigation.location?.pathname === to.split('?')[0];

// True while the app is navigating to `to` — e.g. the slow "Try it out" attempt loader that
// provisions the preview copy. Lets the clicked control show a spinner instead of freezing.
export const useNavigatingTo = (to: string): boolean =>
  isNavigatingTo(useNavigation(), to);
