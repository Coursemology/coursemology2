import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

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

  return (
    <AddButton
      id="new-announcement-button"
      onClick={(): void => setIsOpen(true)}
    >
      {intl.formatMessage(translations.newAnnouncementTooltip)}
    </AddButton>
  );
};

export default injectIntl(NewAnnouncementButton);
