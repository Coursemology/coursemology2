import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import { ErrorTranslation, ErrorType } from './ErrorType';

const useErrorTranslation = (errorType: ErrorType): string => {
  const { t } = useTranslation();
  if (!errorType) {
    return t(translations.errorUnknown);
  }

  return t(ErrorTranslation[errorType]);
};

export default useErrorTranslation;
