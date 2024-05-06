import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';

const FooterContext = createContext(true);
const FooterSetterContext = createContext<(enabled: boolean) => void>(() => {});

const FooterProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [enabled, setEnabled] = useState(true);

  return (
    <FooterContext.Provider value={enabled}>
      <FooterSetterContext.Provider value={setEnabled}>
        {children}
      </FooterSetterContext.Provider>
    </FooterContext.Provider>
  );
};

export const useFooter = (): boolean => useContext(FooterContext);

export const useSetFooter = (enabled: boolean): void => {
  const setFooter = useContext(FooterSetterContext);
  const location = useLocation();

  useEffect(() => {
    setFooter(enabled);

    return () => setFooter(true);
  }, [location.pathname]);
};

export default FooterProvider;
