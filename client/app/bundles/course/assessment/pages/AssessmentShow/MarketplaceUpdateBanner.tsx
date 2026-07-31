import { useState } from 'react';
import { Alert, Button, Typography } from '@mui/material';
import { MarketplaceUpdateData } from 'types/course/assessment/assessments';

import CourseAPI from 'api/course';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import pollJob from 'lib/helpers/jobHelpers';
import { loadingToast } from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import { formatVintagePair } from './versionVintage';

interface Props {
  assessmentId: number;
  update: MarketplaceUpdateData | null;
}

/**
 * Tells a course that already copied a marketplace assessment that a newer version exists.
 * The copy deliberately avoids the words "sync" and "behind": the action replaces
 * untouched local content in place.
 *
 * The notice cannot be dismissed or muted. It is a statement of fact about the copy rather than a
 * notification, so it stands for exactly as long as it is true — until the copy is updated, or
 * deleted.
 */
const MarketplaceUpdateBanner = ({
  assessmentId,
  update,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();
  // Not a dismissal: the update has actually landed, so the banner's claim has stopped being true.
  // The page still holds the pre-update payload (the toast asks for a refresh), so nothing else
  // here can notice.
  const [updated, setUpdated] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!update || updated) return null;

  // Version numbers are not a user-facing concept — a manager who copied this assessment never saw
  // one, and there is no longer one to see. Dates are what they can reason about, so the copy
  // speaks in content vintages, with the time appearing only when it is needed to tell them apart.
  const { adopted: adoptedDate, latest: latestDate } = formatVintagePair(
    update.adoptedVersionAt,
    update.latestVersionAt,
  );

  const updateInPlace = async (): Promise<void> => {
    setSubmitting(true);
    const updateToast = loadingToast(t(translations.marketplaceUpdateStarted));

    try {
      const response =
        await CourseAPI.marketplace.applyLatestVersion(assessmentId);

      pollJob(
        response.data.jobUrl,
        () => {
          updateToast.success(t(translations.marketplaceUpdateCompleted));
          setSubmitting(false);
          setConfirming(false);
          setUpdated(true);
        },
        () => {
          updateToast.error(t(translations.marketplaceUpdateFailed));
          setSubmitting(false);
        },
        2000,
      );
    } catch {
      updateToast.error(t(translations.marketplaceUpdateFailed));
      setSubmitting(false);
    }
  };

  return (
    <>
      <Alert classes={{ message: 'space-y-2' }} severity="info">
        <Typography variant="body2">
          {t(translations.marketplaceUpdateAvailable, {
            adopted: adoptedDate,
            latest: latestDate,
          })}
        </Typography>

        {/* Student work makes an in-place replacement destructive, so there is no action to offer
            — only the reason, so the manager is not left hunting for a button that cannot exist. */}
        {update.canUpdateInPlace ? (
          <Button
            disabled={submitting}
            onClick={(): void => setConfirming(true)}
            size="small"
            variant="contained"
          >
            {t(translations.marketplaceUpdateInPlace)}
          </Button>
        ) : (
          <Typography variant="body2">
            {t(translations.marketplaceUpdateBlocked)}
          </Typography>
        )}
      </Alert>

      <Prompt
        disabled={submitting}
        onClickPrimary={updateInPlace}
        onClose={(): void => setConfirming(false)}
        open={confirming}
        primaryColor="primary"
        primaryLabel={t(translations.marketplaceUpdateInPlace)}
        title={t(translations.marketplaceUpdateConfirmTitle)}
      >
        <PromptText>
          {t(translations.marketplaceUpdateConfirmBody, {
            latest: latestDate,
          })}
        </PromptText>

        {update.testSubmissionCount > 0 && (
          <PromptText>
            {t(translations.marketplaceUpdateConfirmDeletion, {
              count: update.testSubmissionCount,
            })}
          </PromptText>
        )}
      </Prompt>
    </>
  );
};

export default MarketplaceUpdateBanner;
