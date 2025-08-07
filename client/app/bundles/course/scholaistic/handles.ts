import { defineMessage } from 'react-intl';

import { DataHandle } from 'lib/hooks/router/dynamicNest';
import { Descriptor } from 'lib/hooks/useTranslation';

type HandleStorage = Partial<{
  [K in 'assessments' | 'assessment' | 'assistant' | 'submission']:
    | string
    | Descriptor
    | null
    | undefined;
}>;

const asyncHandleStorage: { current?: Promise<HandleStorage> } = {};

export const setAsyncHandle = (promise: Promise<HandleStorage>): void => {
  asyncHandleStorage.current = promise;
};

export const assessmentsHandle: DataHandle = () => ({
  getData: async (): Promise<string | Descriptor> => {
    const handle = await asyncHandleStorage.current;

    return (
      handle?.assessments ||
      defineMessage({ defaultMessage: 'Role-Playing Assessments' })
    );
  },
});

export const assessmentHandle: DataHandle = () => ({
  getData: async (): Promise<string | Descriptor> => {
    const handle = await asyncHandleStorage.current;

    return handle?.assessment || '';
  },
});

export const submissionHandle: DataHandle = () => ({
  getData: async (): Promise<string | Descriptor> => {
    const handle = await asyncHandleStorage.current;

    return handle?.submission || '';
  },
});

export const assistantHandle: DataHandle = () => ({
  getData: async (): Promise<string | Descriptor> => {
    const handle = await asyncHandleStorage.current;

    return handle?.assistant || '';
  },
});
