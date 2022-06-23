import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Feed } from '@mui/icons-material';

interface Props extends WrappedComponentProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const translations = defineMessages({
  tooltip: {
    id: 'system.admin.instance.new',
    defaultMessage: 'New Instance',
  },
});

const NewInstanceButton: FC<Props> = (props) => {
  const { intl, setIsOpen } = props;

  return (
    <Tooltip title={intl.formatMessage(translations.tooltip)}>
      <IconButton
        id="new-instance-button"
        onClick={(): void => {
          setIsOpen(true);
        }}
        sx={{ color: '#ffffff' }}
      >
        <Feed />
      </IconButton>
    </Tooltip>
  );
};

export default injectIntl(NewInstanceButton);
