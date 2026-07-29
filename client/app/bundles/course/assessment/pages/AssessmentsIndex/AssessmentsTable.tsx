import { useMemo } from 'react';
import {
  AssessmentListData,
  AssessmentsListData,
} from 'types/course/assessment/assessments';

import Link from 'lib/components/core/Link';
import Note from 'lib/components/core/Note';
import PersonalStartEndTime from 'lib/components/extensions/PersonalStartEndTime';
import StackedBadges from 'lib/components/extensions/StackedBadges';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import ActionButtons from './ActionButtons';
import MarketplaceVersionChip from './MarketplaceVersionChip';
import StatusBadges from './StatusBadges';

interface AssessmentsTableProps {
  assessments: AssessmentsListData;
}

const AssessmentsTable = (props: AssessmentsTableProps): JSX.Element => {
  const { display, assessments, totalStudentCount } = props.assessments;
  const { t } = useTranslation();

  const isContainer = display.isMarketplaceContainer;

  const listingLabels = useMemo((): Record<number, string> => {
    const newest: Record<number, { title: string; publishedAt: string }> = {};

    assessments.forEach((assessment) => {
      const version = assessment.marketplaceVersion;
      if (!version) return;

      const held = newest[version.listingId];
      const publishedAt = version.publishedAt ?? '';
      if (!held || publishedAt > held.publishedAt)
        newest[version.listingId] = { title: assessment.title, publishedAt };
    });

    return Object.fromEntries(
      Object.entries(newest).map(([listingId, held]) => [
        listingId,
        t(translations.marketplaceListingLabel, {
          title: held.title,
          listingId,
        }),
      ]),
    );
  }, [assessments, t]);

  const listingLabelFor = (assessment: AssessmentListData): string =>
    assessment.marketplaceVersion
      ? listingLabels[assessment.marketplaceVersion.listingId]
      : '';

  /**
   * Live / Latest / Older version / Source Assessment — null for an assessment that belongs to no
   * listing. Live and Latest are mutually exclusive: both mean "newest cut", and Live additionally
   * means the listing is on the marketplace, so it stands in for the weaker label.
   */
  const versionKindFor = (assessment: AssessmentListData): string | null => {
    const version = assessment.marketplaceVersion;
    if (!version) return null;
    if (version.publishedAt === null)
      return t(translations.marketplaceAuthoring);
    if (!version.latest) return t(translations.marketplaceOlderVersion);

    return version.listed
      ? t(translations.marketplaceLive)
      : t(translations.marketplaceLatest);
  };

  const columns: ColumnTemplate<AssessmentListData>[] = [
    {
      of: 'title',
      title: t(translations.title),
      searchable: isContainer,
      cell: (assessment) => (
        <div className="flex flex-col items-start justify-between xl:flex-row xl:items-center">
          <label className="m-0 font-normal" title={assessment.title}>
            <Link
              className="line-clamp-2 xl:line-clamp-1"
              to={assessment.url}
              underline="hover"
            >
              {assessment.title}
            </Link>
          </label>

          <StatusBadges
            for={assessment}
            isStudent={display.isStudent}
            timelineAlgorithm={display.timelineAlgorithm}
          />
        </div>
      ),
    },
    {
      id: 'marketplaceListing',
      title: t(translations.marketplaceListingColumn),
      unless: !isContainer,
      filterable: true,
      filterProps: {
        getValue: (assessment) =>
          assessment.marketplaceVersion ? [listingLabelFor(assessment)] : [],
        shouldInclude: (assessment, filterValue?: string[]) =>
          !filterValue?.length ||
          filterValue.includes(listingLabelFor(assessment)),
      },
      cell: (assessment) =>
        assessment.marketplaceVersion ? (
          <Link
            to={`/admin/marketplace_listings/${assessment.marketplaceVersion.listingId}`}
            underline="hover"
          >
            {listingLabelFor(assessment)}
          </Link>
        ) : (
          t(translations.marketplaceNotAVersion)
        ),
    },
    {
      id: 'marketplaceVersion',
      title: t(translations.marketplaceVersionColumn),
      unless: !isContainer,
      sortable: true,
      filterable: true,
      // Sorts on the publication instant, not the rendered label. The server orders by
      // `ordered_by_date_and_title`, and every snapshot of a listing inherits the origin's identical
      // start_at AND title — so siblings have no tiebreak and their order can differ between loads.
      // This column is how an admin pins them down.
      accessorFn: (assessment) =>
        assessment.marketplaceVersion?.publishedAt ?? '',
      filterProps: {
        getValue: (assessment): string[] => {
          const kind = versionKindFor(assessment);
          return kind ? [kind] : [];
        },
        shouldInclude: (assessment, filterValue?: string[]) =>
          !filterValue?.length ||
          filterValue.includes(versionKindFor(assessment) ?? ''),
      },
      cell: (assessment) =>
        assessment.marketplaceVersion ? (
          <MarketplaceVersionChip for={assessment.marketplaceVersion} />
        ) : (
          t(translations.marketplaceNotAVersion)
        ),
    },
    {
      id: 'marketplaceSource',
      title: t(translations.marketplaceSourceColumn),
      unless: !isContainer,
      sortable: true,
      searchable: true,
      // Deliberately NOT filterable, mirroring MarketplaceListingsTable: source courses number in the
      // hundreds, most contributing one or two listings, and the filter is client-side over loaded
      // rows.
      accessorFn: (assessment) => assessment.marketplaceVersion?.source ?? '',
      cell: (assessment) =>
        assessment.marketplaceVersion?.source ??
        t(translations.marketplaceNotAVersion),
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
      of: 'submittedCount',
      title: t(translations.submittedCount),
      cell: (assessment): JSX.Element | null => {
        if (typeof assessment.submittedCount === 'number') {
          return (
            <span className={assessment.published ? '' : 'text-neutral-400'}>
              {assessment.submittedCount} / {totalStudentCount}
            </span>
          );
        }
        return null;
      },
      unless: typeof totalStudentCount !== 'number',
      className: 'max-lg:!hidden text-right whitespace-nowrap',
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
      renderEmpty={
        isContainer ? (
          <Note message={t(translations.noAssessments)} />
        ) : undefined
      }
      search={
        isContainer
          ? { searchPlaceholder: t(translations.marketplaceSearchText) }
          : undefined
      }
      toolbar={isContainer ? { show: true } : undefined}
    />
  );
};

export default AssessmentsTable;
