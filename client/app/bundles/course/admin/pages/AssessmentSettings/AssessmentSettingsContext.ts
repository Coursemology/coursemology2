import { createContext, useContext } from 'react';

import {
  AssessmentCategory,
  AssessmentSettingsData,
  AssessmentTab,
} from 'types/course/admin/assessments';

export interface AssessmentSettingsContextType {
  settings?: AssessmentSettingsData;
  createCategory?: (
    title: AssessmentCategory['title'],
    weight: AssessmentCategory['weight'],
  ) => void;
  createTabInCategory?: (
    id: AssessmentCategory['id'],
    title: AssessmentTab['title'],
    weight: AssessmentTab['weight'],
  ) => void;
  deleteCategory?: (
    id: AssessmentCategory['id'],
    title: AssessmentCategory['title'],
  ) => void;
  deleteTabInCategory?: (
    id: AssessmentCategory['id'],
    tabId: AssessmentTab['id'],
    title: AssessmentTab['title'],
  ) => void;
  moveAssessmentsToTab?: (
    assessmentIds: number[],
    tabId: AssessmentTab['id'],
    fullTabTitle: string,
  ) => Promise<unknown[]>;
}

const AssessmentSettingsContext = createContext<AssessmentSettingsContextType>(
  {},
);

export const useAssessmentSettings = (): AssessmentSettingsContextType =>
  useContext(AssessmentSettingsContext);

export const AssessmentSettingsProvider = AssessmentSettingsContext.Provider;
