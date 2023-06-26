import { Link } from 'react-router-dom';
import {
  AssessmentListData,
  AssessmentsListData,
} from 'types/course/assessment/assessments';

import Note from 'lib/components/core/Note';
import PersonalStartEndTime from 'lib/components/extensions/PersonalStartEndTime';
import StackedBadges from 'lib/components/extensions/StackedBadges';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import ActionButtons from './ActionButtons';
import StatusBadges from './StatusBadges';

interface AssessmentsTableProps {
  assessments: AssessmentsListData;
}

const AssessmentsTable = (props: AssessmentsTableProps): JSX.Element => {
  const { display, assessments } = props.assessments;
  const { t } = useTranslation();

  const columns: ColumnTemplate<AssessmentListData>[] = [
    {
      of: 'title',
      title: t(translations.title),
      cell: (assessment) => (
        <div className="flex flex-col items-start justify-between xl:flex-row xl:items-center">
          <label className="m-0 font-normal" title={assessment.title}>
            <Link
              // TODO: Change to lg:line-clamp-1 once the current sidebar is gone
              className="line-clamp-2 xl:line-clamp-1"
              to={assessment.url}
            >
              {assessment.title}
            </Link>
          </label>

          {!display.isStudent && <StatusBadges for={assessment} />}
        </div>
      ),
    },
    {
      of: 'baseExp',
      title: t(translations.exp),
      cell: (assessment) => assessment.baseExp ?? '-',
      unless: !display.isGamified,
      className: 'max-md:!hidden text-right',
    },
    {
      of: 'timeBonusExp',
      title: t(translations.bonusExp),
      cell: (assessment) => assessment.timeBonusExp ?? '-',
      unless: !display.bonusAttributes,
      className: 'max-lg:!hidden text-right',
    },
    {
      id: 'conditionals',
      title: t(translations.neededFor),
      cell: (assessment) => (
        <StackedBadges
          badges={assessment.topConditionals}
          remainingCount={assessment.remainingConditionalsCount}
          seeRemainingTooltip={t(translations.seeAllRequirements)}
          seeRemainingUrl={assessment.url}
        />
      ),
      unless: !display.isAchievementsEnabled,
      className: 'max-xl:!hidden whitespace-nowrap',
    },
    {
      of: 'startAt',
      title: t(translations.startsAt),
      cell: (assessment) => (
        <PersonalStartEndTime
          className={
            assessment.isStartTimeBegin
              ? 'text-neutral-400'
              : 'font-bold group-hover?:animate-pulse'
          }
          hideInfo={assessment.status === 'submitted'}
          timeInfo={assessment.startAt}
        />
      ),
      className: 'max-lg:!hidden whitespace-nowrap',
    },
    {
      of: 'bonusEndAt',
      title: t(translations.bonusEndsAt),
      cell: (assessment) => (
        <PersonalStartEndTime
          className={assessment.isBonusEnded ? 'text-neutral-400' : ''}
          hideInfo={assessment.status === 'submitted'}
          timeInfo={assessment.bonusEndAt}
        />
      ),
      unless: !display.bonusAttributes,
      className: 'max-lg:!hidden whitespace-nowrap',
    },
    {
      of: 'endAt',
      title: t(translations.endsAt),
      cell: (assessment) => (
        <PersonalStartEndTime
          className={`${
            display.isStudent &&
            assessment.status !== 'submitted' &&
            assessment.isEndTimePassed
              ? 'text-red-500'
              : ''
          } ${assessment.status === 'submitted' ? 'text-neutral-400' : ''}`}
          hideInfo={assessment.status === 'submitted'}
          timeInfo={assessment.endAt}
        />
      ),
      unless: !display.endTimes,
      className: 'whitespace-nowrap pointer-coarse:max-sm:!hidden',
    },
    {
      id: 'actions',
      title: t(translations.actions),
      className: 'relative',
      cell: (assessment) => (
        <ActionButtons for={assessment} student={display.isStudent} />
      ),
    },
  ];

  if (assessments.length === 0)
    return (
      <Note
        message={
          display.canCreateAssessments
            ? t(translations.createAssessmentToPopulate, {
                category: display.category.title,
              })
            : t(translations.noAssessments)
        }
      />
    );

  return (
    <Table
      className="w-screen border-none sm:w-full"
      columns={columns}
      data={assessments}
      getRowClassName={(assessment): string =>
        `group w-full bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100 ${
          !assessment.isStartTimeBegin ||
          !assessment.conditionSatisfied ||
          assessment.status === 'unavailable'
            ? '!slot-1-neutral-100'
            : ''
        } ${
          assessment.status === 'submitted'
            ? '!slot-1-lime-50 !slot-2-lime-100'
            : ''
        } ${
          assessment.status === 'attempting'
            ? 'shadow-[2px_0_0_0_inset] shadow-amber-500'
            : ''
        }`
      }
      getRowId={(assessment): string => assessment.id.toString()}
    />
  );
};

export default AssessmentsTable;
