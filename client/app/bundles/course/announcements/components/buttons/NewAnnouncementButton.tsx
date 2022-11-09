import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import AddButton from 'lib/components/core/buttons/AddButton';

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
    <AddButton
      id="new-announcement-button"
      onClick={(): void => {
        setIsOpen(true);
      }}
      tooltip={intl.formatMessage(translations.newAnnouncementTooltip)}
    />
  );
};

export default injectIntl(NewAnnouncementButton);
