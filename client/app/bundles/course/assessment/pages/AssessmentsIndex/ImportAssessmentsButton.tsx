import { Button } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface Props {
  canImport: boolean;
  tabId: number;
}

const ImportAssessmentsButton = ({
  canImport,
  tabId,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();
  if (!canImport) return null;

  return (
    <Link to={`../marketplace?from_tab=${tabId}`}>
      <Button variant="outlined">{t(translations.importAssessments)}</Button>
    </Link>
  );
};

export default ImportAssessmentsButton;
