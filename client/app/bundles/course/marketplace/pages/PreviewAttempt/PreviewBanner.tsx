import { ContentCopy } from '@mui/icons-material';
import { Alert, Button } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface PreviewBannerProps {
  listingTitle: string;
  onDuplicate: () => void;
  // Whether this preview will leave AI-graded questions ungraded (PreviewGradingPolicy). Shown only
  // then, so an all-MCQ preview carries no confusing note about graders it never uses.
  previewGradingInert: boolean;
}

const PreviewBanner = ({
  listingTitle,
  onDuplicate,
  previewGradingInert,
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
      {previewGradingInert && <div>{t(translations.previewInertGrading)}</div>}
    </Alert>
  );
};

export default PreviewBanner;
