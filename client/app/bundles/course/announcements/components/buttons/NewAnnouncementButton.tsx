import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button } from '@mui/material';

interface Props extends WrappedComponentProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const translations = defineMessages({
  newAnnouncementTooltip: {
    id: 'course.announcements.NewAnnouncementButton.newAnnouncementTooltip',
    defaultMessage: 'New Announcement',
  },
});

const NewAnnouncementButton: FC<Props> = (props) => {
  const { intl, setIsOpen } = props;

  return (
    <Button
      className="bg-white"
      onClick={(): void => {
        setIsOpen(true);
      }}
      variant="outlined"
    >
      {intl.formatMessage(translations.newAnnouncementTooltip)}
    </Button>
  );
};

export default injectIntl(NewAnnouncementButton);
