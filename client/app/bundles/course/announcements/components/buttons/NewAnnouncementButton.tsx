import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button, useMediaQuery } from '@mui/material';
import AddButton from 'lib/components/core/buttons/AddButton';

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
  const minWidthForAddButtonWithText = useMediaQuery('(min-width:720px)');

  return minWidthForAddButtonWithText ? (
    <Button
      className="bg-white"
      onClick={(): void => {
        setIsOpen(true);
      }}
      variant="outlined"
    >
      {intl.formatMessage(translations.newAnnouncementTooltip)}
    </Button>
  ) : (
    <AddButton
      key="new-announcement-button"
      className="new-announcement-button"
      onClick={(): void => {
        setIsOpen(true);
      }}
      tooltip={intl.formatMessage(translations.newAnnouncementTooltip)}
    />
  );
};

export default injectIntl(NewAnnouncementButton);
