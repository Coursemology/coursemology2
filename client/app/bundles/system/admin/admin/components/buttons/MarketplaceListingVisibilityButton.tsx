import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button } from '@mui/material';
import { AxiosError } from 'axios';
import { MarketplaceListingAdminData } from 'types/system/marketplaceListings';

import SystemAPI from 'api/system';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  listing: MarketplaceListingAdminData;
  /** Called once the flip lands: `state` changes, and with it whether the row can be deleted. */
  onChanged: () => void;
}

const translations = defineMessages({
  unlist: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.unlist',
    defaultMessage: 'Unlist',
  },
  list: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.list',
    defaultMessage: 'List',
  },
  unlistTitle: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.unlistTitle',
    defaultMessage: 'Take this listing off the marketplace?',
  },
  listTitle: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.listTitle',
    defaultMessage: 'Put this listing back on the marketplace?',
  },
  unlistExplanation: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.unlistExplanation',
    defaultMessage:
      'It stops appearing in the marketplace and can no longer be copied or previewed. Nothing is deleted, and courses that already copied it are unaffected.',
  },
  unlistReversible: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.unlistReversible',
    defaultMessage:
      'This is reversible — you can list it again at any time. It is also what has to happen before a listing can be deleted permanently.',
  },
  listExplanation: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.listExplanation',
    defaultMessage:
      'It appears in the marketplace again, serving the version it already holds. No new version is published.',
  },
  unlisted: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.unlisted',
    defaultMessage: 'Listing taken off the marketplace.',
  },
  listed: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.listed',
    defaultMessage: 'Listing is back on the marketplace.',
  },
  failed: {
    id: 'system.admin.admin.MarketplaceListingVisibilityButton.failed',
    defaultMessage: 'Could not change the listing’s visibility.',
  },
});

/**
 * The reversible half of the maintenance pair — unlist, then delete — so the two always sit together
 * on the row and the order between them is legible.
 *
 * One button rather than two, flipping with the state it reads: a listing is on the marketplace or it
 * is not, and offering both actions at once would leave one of them permanently inert.
 */
const MarketplaceListingVisibilityButton = ({
  listing,
  onChanged,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const listed = listing.state === 'published';

  const submit = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await SystemAPI.admin.setMarketplaceListingPublished(listing.id, !listed);
      toast.success(t(listed ? translations.unlisted : translations.listed));
      setOpen(false);
      onChanged();
    } catch (error) {
      // The server owns the one rejection there is — listing something with no published version to
      // serve — so its message is surfaced verbatim rather than restated here.
      const message =
        error instanceof AxiosError
          ? error.response?.data?.errors?.[0]
          : undefined;
      toast.error(message ?? t(translations.failed));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        className="whitespace-nowrap"
        color={listed ? 'error' : 'primary'}
        onClick={(): void => setOpen(true)}
        size="small"
        variant="text"
      >
        {t(listed ? translations.unlist : translations.list)}
      </Button>

      <Prompt
        contentClassName="space-y-4"
        disabled={submitting}
        onClickPrimary={submit}
        onClose={(): void => setOpen(false)}
        open={open}
        primaryColor={listed ? 'error' : 'primary'}
        primaryLabel={t(listed ? translations.unlist : translations.list)}
        title={t(listed ? translations.unlistTitle : translations.listTitle)}
      >
        <PromptText>
          {t(
            listed
              ? translations.unlistExplanation
              : translations.listExplanation,
          )}
        </PromptText>

        {listed && <PromptText>{t(translations.unlistReversible)}</PromptText>}
      </Prompt>
    </>
  );
};

export default MarketplaceListingVisibilityButton;
