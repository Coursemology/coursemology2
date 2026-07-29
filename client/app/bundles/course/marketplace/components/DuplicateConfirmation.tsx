import { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { Card, CardContent, ListSubheader } from '@mui/material';
import { JobStatus } from 'types/jobs';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import { pollJobRequest } from 'lib/helpers/jobHelpers';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { duplicateListings } from '../operations';
import translations from '../translations';
import { DestinationTab, MarketplaceListing } from '../types';

import DestinationTabPicker from './DestinationTabPicker';

const JOB_POLL_INTERVAL_MS = 2000;

interface Props {
  listings: Pick<MarketplaceListing, 'id' | 'title'>[];
  destinationTabs: DestinationTab[];
  initialDestinationTabId: number | null;
  destinationCourse: { title: string; url: string };
  open: boolean;
  onClose: () => void;
}

const DuplicateConfirmation = ({
  listings,
  destinationTabs,
  initialDestinationTabId,
  destinationCourse,
  open,
  onClose,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [jobUrl, setJobUrl] = useState<string | null>(null);
  const pollingRef = useRef(false);

  const n = listings.length;

  // Default selection is the `from_tab` the user launched from when it names a real tab in this
  // course; otherwise fall back to the course's first tab (if any). When the course has no tabs,
  // the selection stays null and the backend applies its own default.
  const resolveInitial = (): number | null => {
    if (
      initialDestinationTabId != null &&
      destinationTabs.some((tab) => tab.id === initialDestinationTabId)
    ) {
      return initialDestinationTabId;
    }
    return destinationTabs[0]?.id ?? null;
  };

  const [selectedTabId, setSelectedTabId] = useState<number | null>(
    resolveInitial(),
  );

  // The pages keep this component mounted and only flip `open`, so `selectedTabId` outlives a close
  // — re-seed it each time the dialog opens, or a tab the user picked and then walked away from
  // would still be selected next time.
  //
  // Deps are `[open]` on purpose. Adding `destinationTabs` would compare it by identity, so any
  // parent re-render passing a fresh array would re-fire this and reset the radio out from under a
  // user mid-decision. Reopening is the only moment the selection should be re-seeded.
  useEffect(() => {
    if (!open) return;
    setSelectedTabId(resolveInitial());
  }, [open]);

  const confirm = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const url = await duplicateListings(
        listings.map((l) => l.id),
        selectedTabId,
      );
      setJobUrl(url);
    } catch {
      // The request never reached the queue, so there is no job to poll. Releasing `submitting`
      // here is what keeps the prompt usable for a retry instead of disabled for good.
      toast.error(t(translations.duplicateFailed, { n }));
      setSubmitting(false);
    }
  };

  // The poller lives with the component that started the job, so unmounting or navigating away
  // tears it down. `pollingRef` stops a slow response from stacking up overlapping requests.
  useEffect(() => {
    if (!jobUrl) return undefined;

    // Called only once the job has finished, so this reports what already happened. `redirectUrl`
    // points at the destination tab; it is optional on JobCompleted, so the link is conditional.
    const finish = (succeeded: boolean, redirectUrl?: string): void => {
      setJobUrl(null);
      setSubmitting(false);
      if (succeeded) {
        toast.success(
          <>
            {t(translations.duplicateCompleted, { n })}
            {redirectUrl && (
              <Link href={redirectUrl}>
                {t(translations.viewDuplicatedAssessment, {
                  n: listings.length,
                })}
              </Link>
            )}
          </>,
        );
        onClose();
      } else {
        toast.error(t(translations.duplicateFailed, { n }));
      }
    };

    const interval = setInterval(() => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      pollJobRequest(jobUrl)
        .then((response) => {
          if (response.status === JobStatus.completed)
            finish(true, response.redirectUrl);
          else if (response.status === JobStatus.errored) finish(false);
        })
        .catch(() => finish(false))
        .finally(() => {
          pollingRef.current = false;
        });
    }, JOB_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [jobUrl, n]);

  return (
    <Prompt
      cancelColor="secondary"
      disabled={submitting}
      onClickPrimary={confirm}
      onClose={onClose}
      open={open}
      primaryColor="primary"
      primaryLabel={t(translations.duplicateConfirm)}
      title={t(translations.confirmationQuestion)}
    >
      <ListSubheader disableSticky>
        {t(translations.destinationCourse)}
      </ListSubheader>
      <Card>
        <CardContent>
          <Link opensInNewTab to={destinationCourse.url} variant="h6">
            {destinationCourse.title}
          </Link>
        </CardContent>
      </Card>

      <ListSubheader disableSticky>
        {t(translations.pickDestinationTab)}
      </ListSubheader>
      <DestinationTabPicker
        onChange={setSelectedTabId}
        tabs={destinationTabs}
        value={selectedTabId}
      />

      <ListSubheader disableSticky>{t(translations.duplicating)}</ListSubheader>
      <Card>
        <CardContent>
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center py-1 text-xl font-bold"
            >
              <TypeBadge dense itemType="ASSESSMENT" />
              <UnpublishedIcon tooltipId="itemUnpublished" />
              {listing.title}
            </div>
          ))}
        </CardContent>
      </Card>
      <Tooltip id="itemUnpublished" style={{ fontSize: '1.4rem' }}>
        {t(translations.itemUnpublished)}
      </Tooltip>
    </Prompt>
  );
};

export default DuplicateConfirmation;
