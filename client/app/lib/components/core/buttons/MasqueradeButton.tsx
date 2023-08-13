import { ComponentProps } from 'react';
import { defineMessages } from 'react-intl';
import TheaterComedy from '@mui/icons-material/TheaterComedy';
import { IconButton, Tooltip } from '@mui/material';

import GlobalAPI from 'api';
import toast from 'lib/hooks/toast/toast';
import useTranslation from 'lib/hooks/useTranslation';

interface MasqueradeButtonProps extends ComponentProps<typeof IconButton> {
  canMasquerade: boolean;
  component?: string;
  href?: string;
}

const translations = defineMessages({
  masqueradeTooltip: {
    id: 'lib.components.core.buttons.MasqueradeButton.masqueradeTooltip',
    defaultMessage: 'Masquerade',
  },
  masqueradeDisabledTooltip: {
    id: 'lib.components.core.buttons.MasqueradeButton.masqueradeDisabledTooltip',
    defaultMessage: 'User not confirmed',
  },
  errorMasquerading: {
    id: 'lib.components.core.buttons.MasqueradeButton.errorMasquerading',
    defaultMessage: 'An error occurred while masquerading. Try again later.',
  },
});

const MasqueradeButton = (props: MasqueradeButtonProps): JSX.Element => {
  const { canMasquerade, href, ...otherProps } = props;

  const { t } = useTranslation();
  const handleClick = async (): Promise<void> => {
    try {
      if (href) {
        await GlobalAPI.users.masquerade(href);
        window.location.href = '/';
      }
    } catch {
      toast.error(t(translations.errorMasquerading));
    }
  };

  return (
    <Tooltip
      title={
        canMasquerade
          ? t(translations.masqueradeTooltip)
          : t(translations.masqueradeDisabledTooltip)
      }
    >
      <IconButton
        disabled={!canMasquerade || !href}
        onClick={handleClick}
        {...otherProps}
      >
        <TheaterComedy />
      </IconButton>
    </Tooltip>
  );
};

export default MasqueradeButton;
