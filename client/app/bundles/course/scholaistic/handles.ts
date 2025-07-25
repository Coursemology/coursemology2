import { defineMessage } from 'react-intl';

import { DataHandle } from 'lib/hooks/router/dynamicNest';
import { Descriptor } from 'lib/hooks/useTranslation';

const handleStorage: Record<string, string | Descriptor> = {};

export const setHandleFromUrl = (
  url: string,
  value: string | Descriptor,
): void => {
  handleStorage[`${new URL(url).pathname}/`] = value;
};

export const scholaisticAssessmentsHandle: DataHandle = (match) => {
  return (
    handleStorage[match.pathname] ||
    defineMessage({
      defaultMessage: 'Role-Playing Assessments',
    })
  );
};
