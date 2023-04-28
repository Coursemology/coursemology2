import { createContext, ReactNode, useContext } from 'react';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

const ProgrammingFormDataContext = createContext<ProgrammingFormData>(
  {} as never,
);

interface ProgrammingFormDataProviderProps {
  from: ProgrammingFormData;
  children: ReactNode;
}

export const ProgrammingFormDataProvider = (
  props: ProgrammingFormDataProviderProps,
): JSX.Element => (
  <ProgrammingFormDataContext.Provider value={props.from}>
    {props.children}
  </ProgrammingFormDataContext.Provider>
);

export const useProgrammingFormDataContext = (): ProgrammingFormData =>
  useContext(ProgrammingFormDataContext);
