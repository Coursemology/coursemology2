import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { IconButton } from '@mui/material';
import { Feed } from '@mui/icons-material';
import CustomTooltip from 'lib/components/CustomTooltip';

interface Props extends WrappedComponentProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const translations = defineMessages({
  newAnnouncementTooltip: {
    id: 'course.announcement.newAnnouncementTooltip',
    defaultMessage: 'New Announcement',
  },
});

const NewAnnouncementButton: FC<Props> = (props) => {
  const { intl, setIsOpen } = props;

  return (
    <CustomTooltip
      title={intl.formatMessage(translations.newAnnouncementTooltip)}
    >
      <IconButton
        id="new-announcement-button"
        onClick={(): void => {
          setIsOpen(true);
        }}
      >
        <Feed />
      </IconButton>
    </CustomTooltip>
  );
};

export default injectIntl(NewAnnouncementButton);
