import { createContext, ReactNode, useContext } from 'react';
import { RubricBasedResponseFormData } from 'types/course/assessment/question/rubric-based-responses';

const RubricBasedResponseFormDataContext =
  createContext<RubricBasedResponseFormData>({} as never);

interface RubricBasedResponseFormDataProviderProps {
  from: RubricBasedResponseFormData;
  children: ReactNode;
}

export const RubricBasedResponseFormDataProvider = (
  props: RubricBasedResponseFormDataProviderProps,
): JSX.Element => (
  <RubricBasedResponseFormDataContext.Provider value={props.from}>
    {props.children}
  </RubricBasedResponseFormDataContext.Provider>
);

export const useRubricBasedResponseFormDataContext =
  (): RubricBasedResponseFormData =>
    useContext(RubricBasedResponseFormDataContext);
