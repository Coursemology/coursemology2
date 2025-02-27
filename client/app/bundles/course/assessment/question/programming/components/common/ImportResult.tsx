import { Alert, Typography } from '@mui/material';
import {
  PackageImportResultData,
  PackageImportResultError,
} from 'types/course/assessment/question/programming';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { BUILD_LOG_ID } from '../sections/BuildLog';

interface ImportResultProps {
  of: PackageImportResultData;
  disabled?: boolean;
}

export const ImportResultErrorMapper = {
  [PackageImportResultError.INVALID_PACKAGE]:
    translations.packageImportInvalidPackage,
  [PackageImportResultError.EVALUATION_TIMEOUT]:
    translations.packageImportEvaluationTimeout,
  [PackageImportResultError.EVALUATION_TIME_LIMIT_EXCEEDED]:
    translations.packageImportTimeLimitExceeded,
  [PackageImportResultError.EVALUATION_ERROR]:
    translations.packageImportEvaluationError,
};

const ImportResult = (props: ImportResultProps): JSX.Element => {
  const { of: result, disabled } = props;

  const { t } = useTranslation();

  const importResultMessage = (): string => {
    if (!result.status) {
      return t(translations.packagePending);
    }
    if (result.status === 'success') {
      return t(translations.packageImportSuccess);
    }
    if (
      !result.error ||
      result.error === PackageImportResultError.GENERIC_ERROR
    ) {
      return t(translations.packageImportGenericError, {
        error: result.message ?? '',
      });
    }
    return t(ImportResultErrorMapper[result.error]);
  };

  return (
    <Alert
      classes={
        disabled
          ? { icon: 'text-neutral-500', root: 'bg-neutral-200' }
          : undefined
      }
      severity={result.status ?? 'info'}
    >
      <Typography variant="body2">{importResultMessage()}</Typography>

      {result.buildLog && (
        <Link href={`#${BUILD_LOG_ID}`}>{t(translations.seeBuildLog)}</Link>
      )}
    </Alert>
  );
};

export default ImportResult;
