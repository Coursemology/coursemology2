import { ContentCopy } from '@mui/icons-material';
import { Alert, Button } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface PreviewBannerProps {
  listingTitle: string;
  onDuplicate: () => void;
}

const PreviewBanner = ({
  listingTitle,
  onDuplicate,
}: PreviewBannerProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Alert
      action={
        <Button
          color="info"
          onClick={onDuplicate}
          startIcon={<ContentCopy />}
          variant="contained"
        >
          {t(translations.duplicateIntoMyCourse)}
        </Button>
      }
      severity="info"
    >
      <div>{t(translations.previewSandbox, { title: listingTitle })}</div>
      <div>{t(translations.previewInertGrading)}</div>
    </Alert>
  );
};

export default PreviewBanner;
