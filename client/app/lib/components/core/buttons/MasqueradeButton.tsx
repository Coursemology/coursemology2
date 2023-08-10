import { ComponentProps } from 'react';
import { defineMessages } from 'react-intl';
import TheaterComedy from '@mui/icons-material/TheaterComedy';
import { IconButton, Tooltip } from '@mui/material';

import Link from 'lib/components/core/Link';
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
});

const MasqueradeButton = (props: MasqueradeButtonProps): JSX.Element => {
  const { canMasquerade, href, ...otherProps } = props;

  const { t } = useTranslation();

  return (
    <Tooltip
      title={
        canMasquerade
          ? t(translations.masqueradeTooltip)
          : t(translations.masqueradeDisabledTooltip)
      }
    >
      <Link to={href}>
        <IconButton disabled={!canMasquerade} {...otherProps}>
          <TheaterComedy />
        </IconButton>
      </Link>
    </Tooltip>
  );
};

export default MasqueradeButton;
