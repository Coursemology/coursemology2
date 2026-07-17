import { useState } from 'react';
import { useIntl } from 'react-intl';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import toast from 'lib/hooks/toast';

import { duplicateListings } from '../operations';
import translations from '../translations';
import { MarketplaceListing } from '../types';

interface Props {
  listings: Pick<MarketplaceListing, 'id' | 'title'>[];
  destinationTabId: number | null;
  open: boolean;
  onClose: () => void;
}

const DuplicateConfirmation = ({
  listings,
  destinationTabId,
  open,
  onClose,
}: Props): JSX.Element => {
  const { formatMessage: t } = useIntl();
  const [submitting, setSubmitting] = useState(false);

  const confirm = async (): Promise<void> => {
    setSubmitting(true);
    await duplicateListings(
      listings.map((l) => l.id),
      destinationTabId,
      () => {
        toast.success(t(translations.duplicateStarted, { n: listings.length }));
        setSubmitting(false);
        onClose();
      },
      () => {
        toast.error(t(translations.duplicateFailed));
        setSubmitting(false);
      },
    );
  };

  return (
    <Prompt
      disabled={submitting}
      onClickPrimary={confirm}
      onClose={onClose}
      open={open}
      primaryLabel={t(translations.duplicateConfirm)}
      title={t(translations.duplicateTitle)}
    >
      <PromptText>
        {t(translations.duplicateBody, { n: listings.length })}
      </PromptText>
    </Prompt>
  );
};

export default DuplicateConfirmation;
