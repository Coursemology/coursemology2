import { useState } from 'react';
import { OpenInNew } from '@mui/icons-material';
import { Button } from '@mui/material';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { navigateTo } from 'lib/helpers/navigation';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { launchPreview } from '../operations';
import translations from '../translations';

interface Props {
  listingId: number;
}

const TryItHandsOnButton = ({ listingId }: Props): JSX.Element => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async (): Promise<void> => {
    // Opened synchronously with the click, before any `await` — a `window.open` issued after an
    // `await` breaks the user-gesture chain and gets popup-blocked (most reliably in Safari).
    const tab = window.open('', '_blank');
    setSubmitting(true);
    try {
      const { url } = await launchPreview(listingId);
      if (tab) {
        tab.location.href = url;
      } else {
        // The browser blocked the popup anyway; degrade to same-tab navigation rather than
        // leaving a dead button.
        navigateTo(url);
      }
      setOpen(false);
    } catch {
      // Never strand the user on a blank about:blank tab.
      tab?.close();
      toast.error(t(translations.launchPreviewFailed));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        color="primary"
        onClick={(): void => setOpen(true)}
        startIcon={<OpenInNew />}
        variant="outlined"
      >
        {t(translations.tryItHandsOn)}
      </Button>
      <Prompt
        disabled={submitting}
        onClickPrimary={confirm}
        onClose={(): void => setOpen(false)}
        open={open}
        primaryColor="primary"
        primaryLabel={t(translations.tryItHandsOn)}
        title={t(translations.tryItHandsOnConfirmTitle)}
      >
        <PromptText>{t(translations.tryItHandsOnConfirmBody)}</PromptText>
      </Prompt>
    </>
  );
};

export default TryItHandsOnButton;
