import { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { Card, CardContent, ListSubheader } from '@mui/material';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { duplicateListings } from '../operations';
import translations from '../translations';
import { DestinationTab, MarketplaceListing } from '../types';

import DestinationTabPicker from './DestinationTabPicker';

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

  // The selected tab defaults to the `from_tab` the user launched from, but only when it names a
  // real tab in this course; otherwise the course's first tab. So exactly one existing tab is
  // always selected, and an unknown/absent from_tab yields null (backend then defaults) rather than
  // a phantom id.
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
    await duplicateListings(
      listings.map((l) => l.id),
      selectedTabId,
      // This is pollJob's *completion* callback — the job has finished by now. `redirectUrl` points
      // at the destination tab; it is optional on JobCompleted, so the link is conditional.
      (redirectUrl) => {
        toast.success(
          <>
            {t(translations.duplicateCompleted, { n: listings.length })}
            {redirectUrl && (
              <>
                {' '}
                <Link href={redirectUrl}>
                  {t(translations.viewDuplicatedAssessment)}
                </Link>
              </>
            )}
          </>,
        );
        setSubmitting(false);
        onClose();
      },
      () => {
        toast.error(t(translations.duplicateFailed, { n: listings.length }));
        setSubmitting(false);
      },
    );
  };

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
