import { defineMessages } from 'react-intl';
import TheaterComedy from '@mui/icons-material/TheaterComedy';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

interface Props extends IconButtonProps {
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

const MasqueradeButton = (props: Props): JSX.Element => {
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
