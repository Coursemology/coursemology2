import { defineMessage } from 'react-intl';

import { DataHandle } from 'lib/hooks/router/dynamicNest';
import { Descriptor } from 'lib/hooks/useTranslation';

const handleStorage: Partial<{
  [K in 'assessments' | 'assessment' | 'assistant' | 'submission']:
    | string
    | Descriptor
    | null
    | undefined;
}> = {};

export const setHandle = (
  key: keyof typeof handleStorage,
  value: string | Descriptor | null | undefined,
): void => {
  handleStorage[key] = value;
};

export const assessmentsHandle: DataHandle = () =>
  handleStorage.assessments ||
  defineMessage({ defaultMessage: 'Role-Playing Assessments' });

export const assessmentHandle: DataHandle = () => handleStorage.assessment;

export const submissionHandle: DataHandle = () => handleStorage.submission;

export const assistantHandle: DataHandle = () => handleStorage.assistant;
