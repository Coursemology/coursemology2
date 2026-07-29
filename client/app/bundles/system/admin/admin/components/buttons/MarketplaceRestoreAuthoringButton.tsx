import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button } from '@mui/material';
import { AxiosError } from 'axios';
import { MarketplaceListingAdminData } from 'types/system/marketplaceListings';

import SystemAPI from 'api/system';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import pollJob from 'lib/helpers/jobHelpers';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

const JOB_POLL_INTERVAL_MS = 2000;

interface Props {
  listing: MarketplaceListingAdminData;
  /**
   * Called once the rebuild job completes: `state`, `authoringAssessmentUrl` and `marketplaceHosted`
   * all change.
   */
  onRestored: () => void;
}

const translations = defineMessages({
  restore: {
    id: 'system.admin.admin.MarketplaceRestoreAuthoringButton.restore',
    defaultMessage: 'Rebuild source assessment',
  },
  confirm: {
    id: 'system.admin.admin.MarketplaceRestoreAuthoringButton.confirm',
    defaultMessage: 'Rebuild',
  },
  explanation: {
    id: 'system.admin.admin.MarketplaceRestoreAuthoringButton.explanation',
    defaultMessage:
      "The latest published version is copied into the marketplace's own container course as a new, editable source assessment, so that new versions can be published from it again.",
  },
  intoContainer: {
    id: 'system.admin.admin.MarketplaceRestoreAuthoringButton.intoContainer',
    defaultMessage:
      'No live course is touched, and the published versions themselves are left unchanged.',
  },
  completed: {
    id: 'system.admin.admin.MarketplaceRestoreAuthoringButton.completed',
    defaultMessage: 'Source assessment rebuilt in the marketplace container.',
  },
  viewRestored: {
    id: 'system.admin.admin.MarketplaceRestoreAuthoringButton.viewRestored',
    defaultMessage: 'View assessment',
  },
  failed: {
    id: 'system.admin.admin.MarketplaceRestoreAuthoringButton.failed',
    defaultMessage: 'Could not rebuild the source assessment.',
  },
});

const MarketplaceRestoreAuthoringButton = ({
  listing,
  onRestored,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const close = (): void => {
    setOpen(false);
  };

  const submit = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const response = await SystemAPI.admin.restoreMarketplaceListingAuthoring(
        listing.id,
      );
      pollJob(
        response.data.jobUrl,
        // pollJob's *completion* callback — the duplication has finished by now, so the list can be
        // refetched and `redirectUrl` points at the assessment that was just created.
        (data) => {
          toast.success(
            <>
              {t(translations.completed)}
              {data.redirectUrl && (
                <>
                  {' '}
                  <Link href={data.redirectUrl}>
                    {t(translations.viewRestored)}
                  </Link>
                </>
              )}
            </>,
          );
          setSubmitting(false);
          close();
          onRestored();
        },
        () => {
          toast.error(t(translations.failed));
          setSubmitting(false);
        },
        JOB_POLL_INTERVAL_MS,
      );
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.errors?.[0]
          : undefined;
      toast.error(message ?? t(translations.failed));
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        className="whitespace-nowrap"
        onClick={(): void => setOpen(true)}
        size="small"
        variant="text"
      >
        {t(translations.restore)}
      </Button>

      <Prompt
        contentClassName="space-y-4"
        disabled={submitting}
        onClickPrimary={submit}
        onClose={close}
        open={open}
        primaryLabel={t(translations.confirm)}
        title={t(translations.restore)}
      >
        <PromptText>{t(translations.explanation)}</PromptText>

        <PromptText>{t(translations.intoContainer)}</PromptText>
      </Prompt>
    </>
  );
};

export default MarketplaceRestoreAuthoringButton;
