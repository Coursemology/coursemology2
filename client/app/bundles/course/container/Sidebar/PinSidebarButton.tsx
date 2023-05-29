import { defineMessages } from 'react-intl';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  minimiseSidebar: {
    id: 'components.SidebarContainer.minimiseSidebar',
    defaultMessage: 'Minimise sidebar',
  },
  pinSidebar: {
    id: 'components.SidebarContainer.pinSidebar',
    defaultMessage: 'Pin sidebar',
  },
});

interface PinSidebarButtonProps {
  open?: boolean;
  onClick?: () => void;
}

const PinSidebarButton = (props: PinSidebarButtonProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div
      className={`flex select-none items-center space-x-2 px-4 py-3 text-neutral-500 hover:bg-neutral-200 active:bg-neutral-300 ${
        props.open ? 'flex-row' : 'flex-row-reverse'
      }`}
      onClick={props.onClick}
      role="button"
      tabIndex={0}
    >
      {props.open ? <ChevronLeft /> : <ChevronRight />}

      <Typography className="leading-none" variant="caption">
        {props.open
          ? t(translations.minimiseSidebar)
          : t(translations.pinSidebar)}
      </Typography>
    </div>
  );
};

export default PinSidebarButton;
