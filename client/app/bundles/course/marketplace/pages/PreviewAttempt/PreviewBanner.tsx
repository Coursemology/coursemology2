import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContentCopy, RestartAlt } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Button } from '@mui/material';

import CourseAPI from 'api/course';
import { useCourseContext } from 'course/container/CourseLoader';
import Prompt from 'lib/components/core/dialogs/Prompt';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicateConfirmation from '../../components/DuplicateConfirmation';
import { fetchListing } from '../../operations';
import translations from '../../translations';
import { ListingPreviewData } from '../../types';

interface Props {
  // The preview attempt's id (== the submission id the reused submission page runs on).
  attemptId: number;
  // The marketplace listing this attempt was launched from — its title + destination tabs feed the
  // Duplicate flow, identical to the listing preview page.
  listingId: number;
}

const PreviewBanner = ({ attemptId, listingId }: Props): JSX.Element => {
  const { t } = useTranslation();
  const { courseTitle, courseUrl } = useCourseContext();
  const [params] = useSearchParams();
  // `from_tab` rides along so a duplicate lands in the tab the user came from; null when absent.
  const fromTab = params.get('from_tab');
  const destinationTabId = parseInt(fromTab ?? '', 10) || null;

  const [listing, setListing] = useState<ListingPreviewData | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchListing(listingId)
      .then((data) => active && setListing(data))
      .catch(() => active && setListing(null));
    return () => {
      active = false;
    };
  }, [listingId]);

  const onReset = async (): Promise<void> => {
    setResetting(true);
    try {
      await CourseAPI.marketplace.resetPreviewAttempt(attemptId);
      toast.success(t(translations.attemptReset));
      // A fresh attempt swaps every answer id; a hard reload re-resumes the (now-empty) attempt
      // through the route loader, the simplest way to repopulate the reused submission page.
      window.location.reload();
    } catch {
      setResetting(false);
      toast.error(t(translations.resetAttemptFailed));
    }
  };

  return (
    <>
      <Alert
        action={
          <div className="flex items-center gap-2">
            <LoadingButton
              color="primary"
              loading={resetting}
              onClick={(): void => setResetConfirmation(true)}
              startIcon={<RestartAlt />}
              variant="outlined"
            >
              {t(translations.resetAttempt)}
            </LoadingButton>
            <Button
              color="primary"
              disabled={!listing}
              onClick={(): void => setDuplicating(true)}
              startIcon={<ContentCopy />}
              variant="contained"
            >
              {t(translations.duplicateAssessment)}
            </Button>
          </div>
        }
        className="mb-5"
        severity="info"
      >
        {t(translations.previewSandbox)}
      </Alert>

      {listing && (
        <DuplicateConfirmation
          destinationCourse={{ title: courseTitle, url: courseUrl }}
          destinationTabs={listing.destinationTabs}
          initialDestinationTabId={destinationTabId}
          listings={[{ id: listing.id, title: listing.title }]}
          onClose={(): void => setDuplicating(false)}
          open={duplicating}
        />
      )}

      <Prompt
        onClickPrimary={(): void => {
          setResetConfirmation(false);
          onReset();
        }}
        onClose={(): void => setResetConfirmation(false)}
        open={resetConfirmation}
        primaryColor="error"
        primaryLabel={t(translations.resetAttempt)}
        title={t(translations.resetAttempt)}
      >
        {t(translations.resetAttemptConfirmation)}
      </Prompt>
    </>
  );
};

export default PreviewBanner;
