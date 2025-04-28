import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

import moment from 'lib/moment';

type FetchStatus = 'loading' | 'success' | 'failure';

interface LastSavedState {
  status?: FetchStatus;
  lastSaved?: moment.Moment;
}

interface LastSavedUpdater {
  abortLoading: () => void;
  startLoading: () => void;
  setLastSavedToNow: () => void;
}

type LastSavedSetter = Dispatch<SetStateAction<LastSavedState>>;

const LastSavedStateContext = createContext<LastSavedState>({});
const LastSavedSetterContext = createContext<LastSavedSetter>(() => {});

interface LoadingProviderProps {
  children: ReactNode;
}

export const LastSavedProvider = (props: LoadingProviderProps): JSX.Element => {
  const [lastSavedState, setLastSavedState] = useState({});

  return (
    <LastSavedStateContext.Provider value={lastSavedState}>
      <LastSavedSetterContext.Provider value={setLastSavedState}>
        {props.children}
      </LastSavedSetterContext.Provider>
    </LastSavedStateContext.Provider>
  );
};

export const useLastSaved = (): LastSavedState =>
  useContext(LastSavedStateContext);

export const useSetLastSaved = (): LastSavedUpdater => {
  const setLastSaved = useContext(LastSavedSetterContext);

  return {
    abortLoading: () =>
      setLastSaved((state) => ({ ...state, status: 'failure' })),
    startLoading: () =>
      setLastSaved((state) => ({ ...state, status: 'loading' })),
    setLastSavedToNow: () =>
      setLastSaved({ status: 'success', lastSaved: moment() }),
  };
};
