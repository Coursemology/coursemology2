import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';

interface AttributionsProviderProps {
  children: ReactNode;
}

export interface Attribution {
  name: string;
  content: ReactNode;
}

export type Attributions = Attribution[];

type AttributionsUpdater = (attributions: Attributions) => void;

const AttributionsContext = createContext<Attributions>([]);
const AttributionsSetterContext = createContext<AttributionsUpdater>(() => {});

const AttributionsProvider = (
  props: AttributionsProviderProps,
): JSX.Element => {
  const [attributions, setAttributions] = useState<Attributions>([]);

  return (
    <AttributionsContext.Provider value={attributions}>
      <AttributionsSetterContext.Provider value={setAttributions}>
        {props.children}
      </AttributionsSetterContext.Provider>
    </AttributionsContext.Provider>
  );
};

export const useAttributions = (): Attributions =>
  useContext(AttributionsContext);

export const useSetAttributions = (attributions?: Attributions): void => {
  const setAttributions = useContext(AttributionsSetterContext);
  const location = useLocation();

  useEffect(() => {
    setAttributions(attributions ?? []);

    return () => setAttributions([]);
  }, [location.pathname]);
};

export default AttributionsProvider;
