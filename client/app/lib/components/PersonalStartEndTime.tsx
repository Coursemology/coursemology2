import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { AccessTime, Lock } from '@mui/icons-material';
import { getDayMonthTime } from 'lib/helpers/timehelper';
import CustomTooltip from './CustomTooltip';

interface Props extends WrappedComponentProps {
  timeInfo: {
    isFixed: boolean;
    effectiveTime?: string;
    referenceTime?: string;
  };
}

const translations = defineMessages({
  timeTooltip: {
    id: 'PersonalStartEndTime.timeTooltip',
    defaultMessage: 'Personalized time is in effect. The original time is',
  },
  altTimeTooltip: {
    id: 'PersonalStartEndTime.altTimeTooltip',
    defaultMessage:
      'Personalized time is in effect. There is no original deadline.',
  },
  lockTooltip: {
    id: 'PersonalStartEndTime.lockTooltip',
    defaultMessage:
      'The timeline for this is locked and will not be automatically modified',
  },
});

/*
This component is meant for displaying effective and reference time differences
when a personalized timeline is in use. For an example, you can make use of the courses
home page.
*/
const PersonalStartEndTime: FC<Props> = (props) => {
  const { intl, timeInfo } = props;
  // Dont leave the space blank
  if (timeInfo.effectiveTime === null) {
    return <div>-</div>;
  }

  return (
    <div style={{ display: 'flex' }}>
      {timeInfo.effectiveTime && (
        <div>{getDayMonthTime(timeInfo.effectiveTime)}</div>
      )}
      <div style={{ marginLeft: 5, marginBottom: -6 }}>
        {timeInfo.isFixed && (
          <CustomTooltip
            title={intl.formatMessage(translations.lockTooltip)}
            arrow
          >
            <Lock fontSize="small" />
          </CustomTooltip>
        )}
      </div>

      {timeInfo.effectiveTime !== timeInfo.referenceTime &&
        timeInfo.effectiveTime &&
        timeInfo.referenceTime && (
          <div style={{ marginLeft: 0, marginBottom: -6 }}>
            <CustomTooltip
              title={
                timeInfo.referenceTime
                  ? `${intl.formatMessage(
                      translations.timeTooltip,
                    )} ${getDayMonthTime(timeInfo.referenceTime)}`
                  : intl.formatMessage(translations.altTimeTooltip)
              }
              arrow
            >
              <AccessTime fontSize="small" />
            </CustomTooltip>
          </div>
        )}
    </div>
  );
};
export default injectIntl(PersonalStartEndTime);
