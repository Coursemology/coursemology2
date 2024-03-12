import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import { ErrorType } from './validations/types';

export const ErrorTranslation = {
  [ErrorType.AttachmentRequired]: translations.attachmentRequired,
};

const isSomeErrorTypeInvalid = (errorTypes: ErrorType[]): boolean => {
  return errorTypes.some(
    (errorType) => !Object.values(ErrorType).includes(errorType),
  );
};

const useErrorTranslation = (errorTypes: ErrorType[]): string[] => {
  const { t } = useTranslation();
  if (errorTypes.length === 0) {
    return [];
  }

  if (isSomeErrorTypeInvalid(errorTypes)) {
    throw new Error('ErrorType is invalid');
  }

  return errorTypes.map((errorType) => t(ErrorTranslation[errorType]));
};

export default useErrorTranslation;
