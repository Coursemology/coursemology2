import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';

import WidthAdjustedNewButton from 'bundles/common/components/WidthAdjustedNewButton';

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
    <WidthAdjustedNewButton
      minWidth={720}
      nonTextButtonClassName="new-announcement-button"
      nonTextButtonKey="new-announcement-button"
      onClick={(): void => setIsOpen(true)}
      text={intl.formatMessage(translations.newAnnouncementTooltip)}
      textButtonClassName="bg-white"
      textButtonKey="new-announcement-button"
    />
  );
};

export default injectIntl(NewAnnouncementButton);
