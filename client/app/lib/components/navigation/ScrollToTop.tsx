import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// In react router v6, navigating between page does not scroll the page back to the top.
// When this component is added to react-router Route's children, it will scroll the page
// to the top when changing pages.
const ScrollToTop = (): null => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
