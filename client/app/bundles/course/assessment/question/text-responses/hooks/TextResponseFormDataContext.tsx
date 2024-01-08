import { createContext, ReactNode } from 'react';
import { TextResponseQuestionFormData } from 'types/course/assessment/question/text-responses';

const TextResponseFormDataContext = createContext<TextResponseQuestionFormData>(
  {} as never,
);

interface TextResponseFormDataProviderProps {
  data: TextResponseQuestionFormData;
  children: ReactNode;
}

export const TextResponseFormDataProvider = (
  props: TextResponseFormDataProviderProps,
): JSX.Element => (
  <TextResponseFormDataContext.Provider value={props.data}>
    {props.children}
  </TextResponseFormDataContext.Provider>
);
