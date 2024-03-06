import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import { ErrorType } from './validations/types';

export const ErrorTranslation = {
  [ErrorType.AttachmentRequired]: translations.attachmentRequired,
  [ErrorType.AtMostOneAttachmentAllowed]: translations.onlyOneAttachmentAllowed,
};

const useErrorTranslation = (errorTypes: ErrorType[]): string[] => {
  const { t } = useTranslation();
  if (errorTypes.length === 0) {
    return [];
  }

  if (
    errorTypes.some(
      (errorType) => !Object.values(ErrorType).includes(errorType),
    )
  ) {
    throw new Error('Error is invalid');
  }

  return errorTypes.map((errorType) => t(ErrorTranslation[errorType]));
};

export default useErrorTranslation;
