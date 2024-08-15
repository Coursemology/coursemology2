import { FC, ReactNode, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Box, Chip, Typography } from '@mui/material';
import palette from 'theme/palette';
import {
  AssessmentLiveFeedbackStatistics,
  MainSubmissionInfo,
} from 'types/course/statistics/assessmentStatistics';

import { fetchLiveFeedbackStatistics } from 'course/assessment/operations/statistics';
import { workflowStates } from 'course/assessment/submission/constants';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import GhostIcon from 'lib/components/icons/GhostIcon';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getClassnameForLiveFeedbackCell } from './classNameUtils';
import { getAssessmentStatistics } from './selectors';

const translations = defineMessages({
  greenCellLegend: {
    id: 'course.assessment.statistics.greenCellLegend',
    defaultMessage: 'Less',
  },
  redCellLegend: {
    id: 'course.assessment.statistics.redCellLegend',
    defaultMessage: 'More',
  },
  name: {
    id: 'course.assessment.statistics.name',
    defaultMessage: 'Name',
  },
  group: {
    id: 'course.assessment.statistics.group',
    defaultMessage: 'Group',
  },
  workflowState: {
    id: 'course.codaveri.statistics.workflowState',
    defaultMessage: 'Status',
  },
  questionIndex: {
    id: 'course.assessment.statistics.questionIndex',
    defaultMessage: 'Q{index}',
  },
  totalFeedbackCount: {
    id: 'course.codaveri.statistics.totalFeedbackCount',
    defaultMessage: 'Total',
  },
  searchText: {
    id: 'course.codaveri.statistics.searchText',
    defaultMessage: 'Search by Name or Groups',
  },
  filename: {
    id: 'course.assessment.statistics.filename',
    defaultMessage: 'Question-level Live Feedback Statistics for {assessment}',
  },
});

const statusTranslations = {
  attempting: 'Attempting',
  submitted: 'Submitted',
  graded: 'Graded, unpublished',
  published: 'Graded',
  unstarted: 'Not Started',
};

interface Props {
  includePhantom: boolean;
}

const LiveHelpStatisticsTable: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { courseId, assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);
  const { includePhantom } = props;

  const statistics = useAppSelector(getAssessmentStatistics);
  const assessment = statistics.assessment;

  const [liveFeedbackStatistics, setLiveFeedbackStatistics] = useState<
    AssessmentLiveFeedbackStatistics[]
  >([]);
  const [parsedStatistics, setParsedStatistics] = useState<
    AssessmentLiveFeedbackStatistics[]
  >([]);
  const [maxFeedbackCount, setMaxFeedbackCount] = useState<number>(0);

  useEffect(() => {
    fetchLiveFeedbackStatistics(parsedAssessmentId).then(
      setLiveFeedbackStatistics,
    );
  }, [parsedAssessmentId]);

  useEffect(() => {
    setMaxFeedbackCount(
      Math.max(
        ...liveFeedbackStatistics.map((s) =>
          Math.max(...(s.liveFeedbackCount ?? []).map((c) => c ?? 0)),
        ),
      ),
    );
    const filteredStats = includePhantom
      ? liveFeedbackStatistics
      : liveFeedbackStatistics.filter((s) => !s.courseUser.isPhantom);
    setParsedStatistics(
      filteredStats
        .sort((a, b) => a.courseUser.name.localeCompare(b.courseUser.name))
        .sort(
          (a, b) =>
            b.liveFeedbackCount.reduce((sum, count) => sum + (count || 0), 0) -
            a.liveFeedbackCount.reduce((sum, count) => sum + (count || 0), 0),
        )
        .sort(
          (a, b) =>
            Number(a.courseUser.isPhantom) - Number(b.courseUser.isPhantom),
        ),
    );
  }, [liveFeedbackStatistics, includePhantom]);

  if (parsedStatistics.length === 0) {
    return <LoadingIndicator />;
  }
  // the case where the live feedback count is null is handled separately inside the column
  // (refer to the definition of statColumns below)
  const renderNonNullAttemptCountCell = (count: number): ReactNode => {
    const classname = getClassnameForLiveFeedbackCell(count, maxFeedbackCount);
    return (
      <div className={classname}>
        <Box>{count}</Box>
      </div>
    );
  };

  // the customised sorting for grades to ensure null always is less than any non-null grade
  const sortNullableLiveFeedbackCount = (
    a: number | null,
    b: number | null,
  ): number => {
    if (a === null && b === null) {
      return 0;
    }
    if (a === null) {
      return -1;
    }
    if (b === null) {
      return 1;
    }
    return a - b;
  };

  const statColumns: ColumnTemplate<AssessmentLiveFeedbackStatistics>[] =
    Array.from({ length: assessment?.questionCount ?? 0 }, (_, index) => {
      return {
        searchProps: {
          getValue: (datum) =>
            datum.liveFeedbackCount?.[index]?.toString() ?? '',
        },
        title: t(translations.questionIndex, { index: index + 1 }),
        cell: (datum): ReactNode => {
          return typeof datum.liveFeedbackCount?.[index] === 'number' ? (
            renderNonNullAttemptCountCell(datum.liveFeedbackCount?.[index])
          ) : (
            <div className="bg-gray-300 p-[1rem]">
              <Box>-</Box>
            </div>
          );
        },
        sortable: true,
        csvDownloadable: true,
        className: 'text-right',
        sortProps: {
          sort: (a, b): number => {
            return sortNullableLiveFeedbackCount(
              a.liveFeedbackCount?.[index] ?? null,
              b.liveFeedbackCount?.[index] ?? null,
            );
          },
        },
      };
    });

  statColumns.push({
    searchProps: {
      getValue: (datum) =>
        datum.liveFeedbackCount
          ? datum.liveFeedbackCount
              .reduce((sum, count) => sum + (count || 0), 0)
              .toString()
          : '',
    },
    title: t(translations.totalFeedbackCount),
    cell: (datum): ReactNode => {
      const totalFeedbackCount = datum.liveFeedbackCount
        ? datum.liveFeedbackCount.reduce((sum, count) => sum + (count || 0), 0)
        : 0;
      return (
        <div className="p-[1rem]">
          <Box>{totalFeedbackCount}</Box>
        </div>
      );
    },
    sortable: true,
    csvDownloadable: true,
    className: 'text-right',
    sortProps: {
      sort: (a, b): number => {
        const totalA = a.liveFeedbackCount
          ? a.liveFeedbackCount.reduce((sum, count) => sum + (count || 0), 0)
          : 0;
        const totalB = b.liveFeedbackCount
          ? b.liveFeedbackCount.reduce((sum, count) => sum + (count || 0), 0)
          : 0;
        return totalA - totalB;
      },
    },
  });

  const jointGroupsName = (datum: MainSubmissionInfo): string =>
    datum.groups ? datum.groups.map((g) => g.name).join(', ') : '';

  const columns: ColumnTemplate<AssessmentLiveFeedbackStatistics>[] = [
    {
      searchProps: {
        getValue: (datum) => datum.courseUser.name,
      },
      title: t(translations.name),
      sortable: true,
      searchable: true,
      cell: (datum) => (
        <div className="flex grow items-center">
          <Link to={`/courses/${courseId}/users/${datum.courseUser.id}`}>
            {datum.courseUser.name}
          </Link>
          {datum.courseUser.isPhantom && (
            <GhostIcon className="ml-2" fontSize="small" />
          )}
        </div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'groups',
      title: t(translations.group),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => jointGroupsName(datum),
      },
      cell: (datum) => jointGroupsName(datum),
      csvDownloadable: true,
    },
    {
      of: 'workflowState',
      title: t(translations.workflowState),
      sortable: true,
      cell: (datum) => (
        <Chip
          className="w-100"
          label={
            statusTranslations[datum.workflowState ?? workflowStates.Unstarted]
          }
          style={{
            backgroundColor:
              palette.submissionStatus[
                datum.workflowState ?? workflowStates.Unstarted
              ],
          }}
          variant="filled"
        />
      ),
      className: 'center',
    },
    ...statColumns,
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption">Least Used</Typography>
        <div
          style={{
            background: 'linear-gradient(to right, #fef2f2, #ef4444)',
            height: '20px',
            width: '25%',
            margin: '0 10px',
          }}
        />
        <Typography variant="caption">
          Most Used (Max: {maxFeedbackCount})
        </Typography>
      </div>

      <Table
        columns={columns}
        csvDownload={{
          filename: t(translations.filename, {
            assessment: assessment?.title ?? '',
          }),
        }}
        data={parsedStatistics}
        getRowClassName={(datum): string =>
          `data_${datum.courseUser.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
        }
        getRowEqualityData={(datum): AssessmentLiveFeedbackStatistics => datum}
        getRowId={(datum): string => datum.courseUser.id.toString()}
        indexing={{ indices: true }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
        }}
        search={{ searchPlaceholder: t(translations.searchText) }}
        toolbar={{ show: true }}
      />
    </>
  );
};

export default LiveHelpStatisticsTable;
