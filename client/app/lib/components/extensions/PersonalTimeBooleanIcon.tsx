import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { AccessTime, Shuffle } from '@mui/icons-material';
import CustomTooltip from 'lib/components/core/CustomTooltip';

interface Props extends WrappedComponentProps {
  showPersonalizedTimelineFeatures: boolean;
  hasPersonalTimes: boolean;
  affectsPersonalTimes: boolean;
}

const translations = defineMessages({
  hasPersonalTimesHint: {
    id: 'PersonalTimeBooleanIcons.hasPersonalTimesHint',
    defaultMessage:
      'Has personal times. Timings for this item will be automatically adjusted for users based on learning rate.',
  },
  affectsPersonalTimesHint: {
    id: 'PersonalTimeBooleanIcons.affectsPersonalTimesHint',
    defaultMessage:
      "Affects personal times. Student's submission time for this item will be taken into account when updating personal times for other items.",
  },
});

const PersonalTimeBooleanIcons: FC<Props> = (props) => {
  const {
    intl,
    showPersonalizedTimelineFeatures,
    hasPersonalTimes,
    affectsPersonalTimes,
  } = props;

  if (!showPersonalizedTimelineFeatures) return null;

  return (
    <>
      {hasPersonalTimes && (
        <CustomTooltip
          title={intl.formatMessage(translations.hasPersonalTimesHint)}
          arrow
        >
          <AccessTime className="mr-2" fontSize="small" />
        </CustomTooltip>
      )}
      {affectsPersonalTimes && (
        <CustomTooltip
          title={intl.formatMessage(translations.affectsPersonalTimesHint)}
          arrow
        >
          <Shuffle className="mr-2" fontSize="small" />
        </CustomTooltip>
      )}
    </>
  );
};

export default injectIntl(PersonalTimeBooleanIcons);
