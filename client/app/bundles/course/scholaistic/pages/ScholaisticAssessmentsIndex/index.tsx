import { useMemo } from 'react';
import { Button, Typography } from '@mui/material';
import { ScholaisticAssessmentData } from 'types/course/scholaistic';
import { cn } from 'utilities';

import assessmentTranslations from 'course/assessment/translations';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import StackedBadges from 'lib/components/extensions/StackedBadges';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';

import ActionButtons from './ActionButtons';
import { useLoader } from './loader';

const ScholaisticAssessmentsIndex = (): JSX.Element => {
  const data = useLoader();

  const { t } = useTranslation();

  const { hasBonusAttributes, hasEndTimes } = useMemo(() => {
    const result = { hasBonusAttributes: false, hasEndTimes: false };

    // eslint-disable-next-line no-restricted-syntax
    for (const assessment of data.assessments) {
      if (result.hasBonusAttributes && result.hasEndTimes) break;

      result.hasBonusAttributes ||= assessment.timeBonusExp !== undefined;
      result.hasEndTimes ||= assessment.endAt !== undefined;
    }

    return result;
  }, [data.assessments]);

  const columns: ColumnTemplate<ScholaisticAssessmentData>[] = [
    {
      of: 'title',
      title: t(assessmentTranslations.title),
      cell: (assessment) => (
        <Link
          className="line-clamp-2 xl:line-clamp-1"
          to={assessment.id}
          underline="hover"
        >
          {assessment.title}
        </Link>
      ),
    },
    {
      of: 'baseExp',
      title: t(assessmentTranslations.exp),
      cell: (assessment) => assessment.baseExp ?? '-',
      unless: !data.display.isGamified,
      className: 'max-md:!hidden text-right',
    },
    {
      of: 'timeBonusExp',
      title: t(assessmentTranslations.bonusExp),
      cell: (assessment) => assessment.timeBonusExp ?? '-',
      unless: !hasBonusAttributes,
      className: 'max-lg:!hidden text-right',
    },
    {
      id: 'conditionals',
      title: t(assessmentTranslations.neededFor),
      cell: (assessment) => (
        <StackedBadges
          badges={assessment.topConditionals}
          remainingCount={assessment.remainingConditionalsCount}
          seeRemainingTooltip={t(assessmentTranslations.seeAllRequirements)}
          seeRemainingUrl={assessment.id}
        />
      ),
      unless: !data.display.isAchievementsEnabled,
      className: 'max-xl:!hidden whitespace-nowrap',
    },
    {
      of: 'startAt',
      title: t(assessmentTranslations.startsAt),
      cell: (assessment) => (
        <Typography
          className={
            assessment.isStartTimeBegin
              ? 'text-neutral-400'
              : 'font-bold group-hover?:animate-pulse'
          }
          variant="body2"
        >
          {formatMiniDateTime(assessment.startAt)}
        </Typography>
      ),
      className: 'max-lg:!hidden whitespace-nowrap',
    },
    {
      of: 'bonusEndAt',
      title: t(assessmentTranslations.bonusEndsAt),
      cell: (assessment) => (
        <Typography
          className={cn({ 'text-neutral-400': assessment.isBonusEnded })}
          variant="body2"
        >
          {assessment.bonusEndAt
            ? formatMiniDateTime(assessment.bonusEndAt)
            : '-'}
        </Typography>
      ),
      unless: !hasBonusAttributes,
      className: 'max-lg:!hidden whitespace-nowrap',
    },
    {
      of: 'endAt',
      title: t(assessmentTranslations.endsAt),
      cell: (assessment) => (
        <Typography
          className={cn({
            'text-red-500':
              data.display.isStudent &&
              assessment.status !== 'submitted' &&
              assessment.isEndTimePassed,
            'text-neutral-400': assessment.status === 'submitted',
          })}
          variant="body2"
        >
          {assessment.endAt ? formatMiniDateTime(assessment.endAt) : '-'}
        </Typography>
      ),
      unless: !hasEndTimes,
      className: 'whitespace-nowrap pointer-coarse:max-sm:!hidden',
    },
    {
      id: 'actions',
      title: t(assessmentTranslations.actions),
      className: 'relative',
      cell: (assessment) => (
        <ActionButtons
          assessmentId={assessment.id}
          showEditButton={data.display.canEditAssessments}
          showSubmissionsButton={data.display.canViewSubmissions}
          status={assessment.status}
        />
      ),
    },
  ];

  return (
    <Page
      actions={
        data.display.canCreateAssessments && (
          <Link to="new">
            <Button variant="outlined">
              {t(assessmentTranslations.newAssessment)}
            </Button>
          </Link>
        )
      }
      title={
        data.assessmentsTitle ??
        t({ defaultMessage: 'Role-Playing Assessments' })
      }
      unpadded
    >
      <Table
        className="border-none"
        columns={columns}
        data={data.assessments}
        getRowClassName={(assessment) =>
          cn('bg-white hover?:bg-neutral-100', {
            'bg-neutral-100 hover?:bg-neutral-200/50':
              !assessment.isStartTimeBegin ||
              !assessment.conditionSatisfied ||
              assessment.status === 'unavailable',
            'bg-lime-50 hover?:bg-lime-100': assessment.status === 'submitted',
            'shadow-[2px_0_0_0_inset] shadow-amber-500':
              assessment.status === 'attempting',
          })
        }
        getRowId={(assessment) => assessment.id}
      />
    </Page>
  );
};

export default ScholaisticAssessmentsIndex;
