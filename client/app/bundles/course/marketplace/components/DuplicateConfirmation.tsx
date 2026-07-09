import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, ListSubheader } from '@mui/material';
import { JobStatus } from 'types/jobs';

import DuplicationAssessmentTree from 'course/duplication/components/DuplicationAssessmentTree';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import { pollJobRequest } from 'lib/helpers/jobHelpers';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { duplicateListings } from '../operations';
import translations from '../translations';
import { MarketplaceListing } from '../types';

const JOB_POLL_INTERVAL_MS = 2000;

interface Props {
  listings: Pick<MarketplaceListing, 'id' | 'title'>[];
  destinationTabId: number | null;
  destinationCourse: { title: string; url: string };
  destinationCategory: { id: number; title: string } | null;
  destinationTab: { id: number; title: string } | null;
  open: boolean;
  onClose: () => void;
}

const DuplicateConfirmation = ({
  listings,
  destinationTabId,
  destinationCourse,
  destinationCategory,
  destinationTab,
  open,
  onClose,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [jobUrl, setJobUrl] = useState<string | null>(null);
  const pollingRef = useRef(false);

  const n = listings.length;

  const confirm = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const url = await duplicateListings(
        listings.map((l) => l.id),
        destinationTabId,
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

    const finish = (succeeded: boolean): void => {
      setJobUrl(null);
      setSubmitting(false);
      if (succeeded) {
        toast.success(t(translations.duplicateStarted, { n }));
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
          if (response.status === JobStatus.completed) finish(true);
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
      disabled={submitting}
      onClickPrimary={confirm}
      onClose={onClose}
      open={open}
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
        {t(translations.assessmentsHeading)}
      </ListSubheader>
      <DuplicationAssessmentTree
        nodes={[
          {
            category: destinationCategory,
            tabs: [{ tab: destinationTab, assessments: listings }],
          },
        ]}
      />
    </Prompt>
  );
};

export default DuplicateConfirmation;
