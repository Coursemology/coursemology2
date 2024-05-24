import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Schedule, Shuffle } from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';
import { TimelineAlgorithm } from 'types/course/personalTimes';

import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  hasPersonalTimes: boolean;
  affectsPersonalTimes: boolean;
  isStudent: boolean;
  timelineAlgorithm: TimelineAlgorithm | undefined;
}

const translations = defineMessages({
  hasPersonalTimes: {
    id: 'lib.components.extensions.PersonalTimeBooleanIcons.hasPersonalTimes',
    defaultMessage: 'Has personal times',
  },
  hasPersonalTimesHint: {
    id: 'lib.components.extensions.PersonalTimeBooleanIcons.hasPersonalTimesHint',
    defaultMessage:
      "Timings for this item will automatically be adjusted based on students' learning rate.",
  },
  affectsPersonalTimes: {
    id: 'lib.components.extensions.PersonalTimeBooleanIcons.affectsPersonalTimes',
    defaultMessage: 'Affects personal times',
  },
  affectsPersonalTimesHint: {
    id: 'lib.components.extensions.PersonalTimeBooleanIcons.affectsPersonalTimesHint',
    defaultMessage:
      'Completion of this item may affect the timings for subsequent items.',
  },
});

const PersonalTimeBooleanIcons: FC<Props> = (props) => {
  const {
    hasPersonalTimes,
    affectsPersonalTimes,
    isStudent,
    timelineAlgorithm,
  } = props;
  const { t } = useTranslation();

  // If student is NOT on fixed timeline algorithm, then show, otherwise can hide
  const isFixedStudent =
    isStudent && (timelineAlgorithm === 'fixed' || !timelineAlgorithm);
  const hasPersonalTimesCondition = hasPersonalTimes && !isFixedStudent;
  const affectsPersonalTimesCondition = affectsPersonalTimes && !isFixedStudent;

  return (
    <>
      {hasPersonalTimesCondition && (
        <Tooltip
          disableInteractive
          title={
            <section className="flex flex-col space-y-2">
              <Typography variant="body2">
                {t(translations.hasPersonalTimes)}
              </Typography>

              <Typography variant="caption">
                {t(translations.hasPersonalTimesHint)}
              </Typography>
            </section>
          }
        >
          <Schedule className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}

      {affectsPersonalTimesCondition && (
        <Tooltip
          disableInteractive
          title={
            <section className="flex flex-col space-y-2">
              <Typography variant="body2">
                {t(translations.affectsPersonalTimes)}
              </Typography>

              <Typography variant="caption">
                {t(translations.affectsPersonalTimesHint)}
              </Typography>
            </section>
          }
        >
          <Shuffle className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}
    </>
  );
};

export default PersonalTimeBooleanIcons;
