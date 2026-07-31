/**
 * Performs a full-page navigation, leaving the SPA.
 *
 * Exists as a seam, not an abstraction: jsdom seals the whole navigation surface — `window.location`,
 * `location.href` and `location.assign` are all non-configurable, and a real `href` assignment is
 * swallowed with a virtual-console warning instead of throwing. So a component that navigates
 * inline has no assertable behaviour, and a test of that branch passes whether or not the branch
 * still exists. Routing through this module gives tests something to `jest.mock`.
 *
 * Use it where a full page load is genuinely wanted (a cross-instance url, a Rails-rendered page).
 * Within the SPA, prefer react-router's `useNavigate`.
 *
 * @param url The url to navigate to.
 */
export const navigateTo = (url: string): void => {
  window.location.href = url;
};
