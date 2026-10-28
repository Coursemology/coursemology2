import { defineMessages } from 'react-intl';
import { MenuOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  showSidebar: {
    id: 'components.SidebarContainer.showSidebar',
    defaultMessage: 'Show sidebar',
  },
});

interface ShowSidebarButtonProps {
  /** Usually the `show` handle of a SidebarContainer ref. */
  onClick: () => void;
}

/** Shown in place of a minimised sidebar, to bring it back. */
const ShowSidebarButton = (props: ShowSidebarButtonProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t(translations.showSidebar)}>
      <IconButton
        aria-label={t(translations.showSidebar)}
        onClick={props.onClick}
      >
        <MenuOutlined />
      </IconButton>
    </Tooltip>
  );
};

export default ShowSidebarButton;
