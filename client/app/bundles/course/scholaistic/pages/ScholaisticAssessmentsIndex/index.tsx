import { useMemo } from 'react';
import { Block } from '@mui/icons-material';
import { Button, Chip, Tooltip, Typography } from '@mui/material';
import { ScholaisticAssessmentData } from 'types/course/scholaistic';
import { cn } from 'utilities';

import assessmentTranslations from 'course/assessment/translations';
import { withScholaisticAsyncContainer } from 'course/scholaistic/components/ScholaisticAsyncContainer';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';

import ActionButtons from './ActionButtons';
import { useLoader } from './loader';

const ScholaisticAssessmentsIndex = (): JSX.Element => {
  const data = useLoader();

  const { t } = useTranslation();

  const hasEndTimes = useMemo(
    () => data.assessments.some(({ endAt }) => endAt !== undefined),
    [data.assessments],
  );

  const columns: ColumnTemplate<ScholaisticAssessmentData>[] = [
    {
      of: 'title',
      title: t(assessmentTranslations.title),
      cell: (assessment) => (
        <div className="flex flex-col items-start justify-between gap-2 xl:flex-row xl:items-center">
          <Link
            className="line-clamp-2 xl:line-clamp-1"
            to={assessment.id.toString()}
            underline="hover"
          >
            {assessment.title}
          </Link>

          {!assessment.published && (
            <Tooltip
              disableInteractive
              title={t(assessmentTranslations.draftHint)}
            >
              <Chip
                color="warning"
                icon={<Block />}
                label={t(assessmentTranslations.draft)}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
        </div>
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
          isStartTimeBegin={assessment.isStartTimeBegin}
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
        data.display.assessmentsTitle ??
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
              assessment.status === 'unavailable' ||
              !assessment.isStartTimeBegin,
            'bg-lime-50 hover?:bg-lime-100': assessment.status === 'submitted',
            'shadow-[2px_0_0_0_inset] shadow-amber-500':
              assessment.status === 'attempting',
          })
        }
        getRowId={(assessment) => assessment.id.toString()}
      />
    </Page>
  );
};

export default withScholaisticAsyncContainer(ScholaisticAssessmentsIndex);
