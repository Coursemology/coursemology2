import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Alert, Button } from '@mui/material';

import Prompt from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  openToEveryone: boolean;
  onOpenToEveryone: () => Promise<void>;
  onRestrict: () => Promise<void>;
}

const translations = defineMessages({
  scopedTitle: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.scopedTitle',
    defaultMessage: 'Access is limited to the rules below.',
  },
  everyoneTitle: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.everyoneTitle',
    defaultMessage:
      'The marketplace is open to all course managers. The rules below are preserved but inactive.',
  },
  openButton: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.openButton',
    defaultMessage: 'Open to everyone',
  },
  restrictButton: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.restrictButton',
    defaultMessage: 'Restrict to scoped rules',
  },
  openConfirmTitle: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.openConfirmTitle',
    defaultMessage: 'Open marketplace to everyone?',
  },
  openConfirmBody: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.openConfirmBody',
    defaultMessage:
      'This makes the marketplace visible to all course managers and owners in every instance. You can restrict it again at any time; your scoped rules are kept.',
  },
  restrictConfirmTitle: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.restrictConfirmTitle',
    defaultMessage: 'Restrict to scoped rules?',
  },
  restrictConfirmBody: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.restrictConfirmBody',
    defaultMessage:
      'The marketplace will again be limited to the rules below. Managers not covered by a rule will lose access.',
  },
  confirmOpen: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.confirmOpen',
    defaultMessage: 'Open to everyone',
  },
  confirmRestrict: {
    id: 'system.admin.admin.MarketplaceAllowlistModeBanner.confirmRestrict',
    defaultMessage: 'Restrict',
  },
});

const MarketplaceAllowlistModeBanner = ({
  openToEveryone,
  onOpenToEveryone,
  onRestrict,
}: Props): JSX.Element => {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    setSubmitting(true);
    try {
      await (openToEveryone ? onRestrict() : onOpenToEveryone());
      setIsConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Alert
        action={
          <Button
            color="inherit"
            disabled={submitting}
            onClick={(): void => setIsConfirmOpen(true)}
            size="small"
          >
            {openToEveryone
              ? t(translations.restrictButton)
              : t(translations.openButton)}
          </Button>
        }
        className="mb-4"
        severity={openToEveryone ? 'success' : 'info'}
      >
        {openToEveryone
          ? t(translations.everyoneTitle)
          : t(translations.scopedTitle)}
      </Alert>

      <Prompt
        onClickPrimary={handleConfirm}
        onClose={(): void => setIsConfirmOpen(false)}
        open={isConfirmOpen}
        primaryColor={openToEveryone ? 'error' : 'primary'}
        primaryDisabled={submitting}
        primaryLabel={
          openToEveryone
            ? t(translations.confirmRestrict)
            : t(translations.confirmOpen)
        }
        title={
          openToEveryone
            ? t(translations.restrictConfirmTitle)
            : t(translations.openConfirmTitle)
        }
      >
        {openToEveryone
          ? t(translations.restrictConfirmBody)
          : t(translations.openConfirmBody)}
      </Prompt>
    </>
  );
};

export default MarketplaceAllowlistModeBanner;
