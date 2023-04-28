import { Alert, Typography } from '@mui/material';
import { PackageImportResultData } from 'types/course/assessment/question/programming';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { BUILD_LOG_ID } from '../sections/BuildLog';

interface ImportResultProps {
  of: PackageImportResultData;
  disabled?: boolean;
}

const ImportResult = (props: ImportResultProps): JSX.Element => {
  const { of: result, disabled } = props;

  const { t } = useTranslation();

  return (
    <Alert
      classes={
        disabled
          ? { icon: 'text-neutral-500', root: 'bg-neutral-200' }
          : undefined
      }
      severity={result.status ?? 'info'}
    >
      <Typography variant="body2">
        {result.importResultMessage ?? t(translations.packagePending)}
      </Typography>

      {result.buildLog && (
        <Link href={`#${BUILD_LOG_ID}`}>{t(translations.seeBuildLog)}</Link>
      )}
    </Alert>
  );
};

export default ImportResult;
