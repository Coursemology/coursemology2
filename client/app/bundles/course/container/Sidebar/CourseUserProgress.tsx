import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';
import { CourseUserProgressData } from 'types/course/courses';

import StackedBadges from 'lib/components/extensions/StackedBadges';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

const standardFormatter = new Intl.NumberFormat('en');

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

const translations = defineMessages({
  max: {
    id: 'course.courses.CourseUserProgress.max',
    defaultMessage: 'Max',
  },
  expCounter: {
    id: 'course.courses.CourseUserProgress.expCounter',
    defaultMessage: '{exp} <small>EXP</small>',
  },
  expTotal: {
    id: 'course.courses.CourseUserProgress.expTotal',
    defaultMessage: '{exp} <small>EXP</small> total',
  },
  expToNextLevel: {
    id: 'course.courses.CourseUserProgress.expToNextLevel',
    defaultMessage: '{exp} <small>EXP</small> to next level',
  },
  seeAllAchievements: {
    id: 'course.courses.CourseUserProgress.seeAllAchievements',
    defaultMessage: 'See all achievements',
  },
});

interface CourseUserProgressProps {
  from: CourseUserProgressData;
}

const formatEXP = (exp: number): string =>
  (exp < 1_000_000_000_000 ? standardFormatter : compactFormatter).format(exp);

const CourseUserProgress = (props: CourseUserProgressProps): JSX.Element => {
  const { from: data } = props;

  const { t } = useTranslation();

  return (
    <section className="flex items-center space-x-4">
      <div className="flex flex-col space-y-3">
        {data.nextLevelExpDelta === 'max' ? (
          <div className="flex space-x-3">
            <Typography
              className="h-8 rounded-full px-2 text-center uppercase text-primary ring-1 ring-primary"
              variant="body2"
            >
              {t(translations.max)}
            </Typography>

            <Typography variant="body2">
              {t(translations.expCounter, {
                exp: formatEXP(data.exp ?? 0),
                small: (chunk) => <small>{chunk}</small>,
              })}
            </Typography>
          </div>
        ) : (
          <div className="flex flex-col space-y-1">
            {data.nextLevelExpDelta && (
              <Typography className="leading-none" variant="body2">
                {t(translations.expToNextLevel, {
                  exp: standardFormatter.format(data?.nextLevelExpDelta ?? 0),
                  small: (chunk) => <small>{chunk}</small>,
                })}
              </Typography>
            )}

            <Typography color="text.secondary" variant="caption">
              {t(translations.expTotal, {
                exp: formatEXP(data.exp ?? 0),
                small: (chunk) => <small>{chunk}</small>,
              })}
            </Typography>
          </div>
        )}

        {Boolean(data.recentAchievements?.length) && (
          <div
            className="slot-1-neutral-100 group-hover/user:slot-1-neutral-200"
            onClick={(e): void => e.stopPropagation()}
          >
            <StackedBadges
              badges={data.recentAchievements}
              remainingCount={data.remainingAchievementsCount}
              seeRemainingTooltip={t(translations.seeAllAchievements)}
              seeRemainingUrl={`/courses/${getCourseId()}/achievements`}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseUserProgress;
