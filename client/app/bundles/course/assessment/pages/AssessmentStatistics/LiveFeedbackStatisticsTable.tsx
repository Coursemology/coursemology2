import { FC, ReactNode, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { AssessmentLiveFeedbackStatistics } from 'types/course/statistics/assessmentStatistics';

import SubmissionWorkflowState from 'course/assessment/submission/components/SubmissionWorkflowState';
import { workflowStates } from 'course/assessment/submission/constants';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import GhostIcon from 'lib/components/icons/GhostIcon';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { getEditSubmissionURL } from 'lib/helpers/url-builders';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getClassnameForLiveFeedbackCell } from './classNameUtils';
import LiveFeedbackHistoryContent from './LiveFeedbackHistory';
import { getAssessmentStatistics } from './selectors';
import translations from './translations';
import { getJointGroupsName } from './utils';

interface Props {
  includePhantom: boolean;
  liveFeedbackStatistics: AssessmentLiveFeedbackStatistics[];
}

const LiveFeedbackStatisticsTable: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { courseId, assessmentId } = useParams();
  const { includePhantom, liveFeedbackStatistics } = props;
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const statistics = useAppSelector(getAssessmentStatistics);
  const assessment = statistics.assessment;

  const [parsedStatistics, setParsedStatistics] = useState<
    AssessmentLiveFeedbackStatistics[]
  >([]);
  const [upperQuartileFeedbackCount, setUpperQuartileFeedbackCount] =
    useState<number>(0);

  const [openLiveFeedbackHistory, setOpenLiveFeedbackHistory] = useState(false);
  const [liveFeedbackInfo, setLiveFeedbackInfo] = useState({
    courseUserId: 0,
    questionId: 0,
    questionNumber: 0,
  });

  useEffect(() => {
    const feedbackCounts = liveFeedbackStatistics
      .flatMap((s) => s.liveFeedbackCount ?? [])
      .map((c) => c ?? 0)
      .filter((c) => c !== 0)
      .sort((a, b) => a - b);
    const upperQuartilePercentileIndex = Math.floor(
      0.75 * (feedbackCounts.length - 1),
    );
    const upperQuartilePercentileValue =
      feedbackCounts[upperQuartilePercentileIndex];
    setUpperQuartileFeedbackCount(upperQuartilePercentileValue);

    const filteredStats = includePhantom
      ? liveFeedbackStatistics
      : liveFeedbackStatistics.filter((s) => !s.courseUser.isPhantom);

    filteredStats.forEach((stat) => {
      stat.totalFeedbackCount =
        stat.liveFeedbackCount?.reduce((sum, count) => sum + (count || 0), 0) ??
        0;
    });

    setParsedStatistics(
      filteredStats.sort((a, b) => {
        const phantomDiff =
          Number(a.courseUser.isPhantom) - Number(b.courseUser.isPhantom);
        if (phantomDiff !== 0) return phantomDiff;

        const feedbackDiff =
          (b.totalFeedbackCount ?? 0) - (a.totalFeedbackCount ?? 0);
        if (feedbackDiff !== 0) return feedbackDiff;

        return a.courseUser.name.localeCompare(b.courseUser.name);
      }),
    );
  }, [liveFeedbackStatistics, includePhantom]);

  // the case where the live feedback count is null is handled separately inside the column
  // (refer to the definition of statColumns below)
  const renderNonNullClickableLiveFeedbackCountCell = (
    count: number,
    courseUserId: number,
    questionId: number,
    questionNumber: number,
  ): ReactNode => {
    const classname = getClassnameForLiveFeedbackCell(
      count,
      upperQuartileFeedbackCount,
    );
    if (count === 0) {
      return <Box>{count}</Box>;
    }
    return (
      <div
        className={`cursor-pointer ${classname}`}
        onClick={(): void => {
          setOpenLiveFeedbackHistory(true);
          setLiveFeedbackInfo({ courseUserId, questionId, questionNumber });
        }}
      >
        <Box>{count}</Box>
      </div>
    );
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
          return typeof datum.liveFeedbackCount?.[index] === 'number'
            ? renderNonNullClickableLiveFeedbackCountCell(
                datum.liveFeedbackCount?.[index],
                datum.courseUser.id,
                datum.questionIds[index],
                index + 1,
              )
            : null;
        },
        sortable: true,
        csvDownloadable: true,
        className: 'text-right',
        sortProps: {
          sort: (a, b): number => {
            const aValue =
              a.liveFeedbackCount?.[index] ?? Number.MIN_SAFE_INTEGER;
            const bValue =
              b.liveFeedbackCount?.[index] ?? Number.MIN_SAFE_INTEGER;

            return aValue - bValue;
          },
        },
      };
    });

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
      searchProps: {
        getValue: (datum) => datum.courseUser.email,
      },
      title: t(translations.email),
      hidden: true,
      cell: (datum) => (
        <div className="flex grow items-center">{datum.courseUser.email}</div>
      ),
      csvDownloadable: true,
    },
    {
      of: 'groups',
      title: t(translations.group),
      sortable: true,
      searchable: true,
      searchProps: {
        getValue: (datum) => getJointGroupsName(datum.groups),
      },
      cell: (datum) => getJointGroupsName(datum.groups),
      csvDownloadable: true,
    },
    {
      of: 'workflowState',
      title: t(translations.workflowState),
      sortable: true,
      cell: (datum) => (
        <SubmissionWorkflowState
          linkTo={getEditSubmissionURL(
            courseId,
            assessmentId,
            datum.submissionId,
          )}
          opensInNewTab
          workflowState={datum.workflowState ?? workflowStates.Unstarted}
        />
      ),
      className: 'center',
    },
    ...statColumns,
    {
      searchProps: {
        getValue: (datum) =>
          datum.liveFeedbackCount
            ? datum.liveFeedbackCount
                .reduce((sum, count) => sum + (count || 0), 0)
                .toString()
            : '',
      },
      title: t(translations.total),
      cell: (datum): ReactNode => {
        const totalFeedbackCount = datum.liveFeedbackCount
          ? datum.liveFeedbackCount.reduce(
              (sum, count) => sum + (count || 0),
              0,
            )
          : null;
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
          const totalA = a.totalFeedbackCount ?? 0;
          const totalB = b.totalFeedbackCount ?? 0;
          return totalA - totalB;
        },
      },
    },
  ];

  return (
    <>
      <div className="flex items-center">
        <Typography variant="caption">
          {t(translations.legendLowerUsage)}
        </Typography>
        {
          // The gradient color bar
          <div className="h-5 w-1/4 mx-2 bg-gradient-to-r from-red-100 to-red-500" />
        }
        <Typography variant="caption">
          {t(translations.legendHigherusage)}
        </Typography>
      </div>

      <Table
        columns={columns}
        csvDownload={{
          filename: t(translations.liveFeedbackFilename, {
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
        search={{ searchPlaceholder: t(translations.nameGroupsSearchText) }}
        toolbar={{ show: true }}
      />
      <Prompt
        cancelLabel={t(translations.closePrompt)}
        maxWidth="lg"
        onClose={(): void => setOpenLiveFeedbackHistory(false)}
        open={openLiveFeedbackHistory}
        title={t(translations.liveFeedbackHistoryPromptTitle)}
      >
        <LiveFeedbackHistoryContent
          assessmentId={parsedAssessmentId}
          courseUserId={liveFeedbackInfo.courseUserId}
          questionId={liveFeedbackInfo.questionId}
          questionNumber={liveFeedbackInfo.questionNumber}
        />
      </Prompt>
    </>
  );
};

export default LiveFeedbackStatisticsTable;
