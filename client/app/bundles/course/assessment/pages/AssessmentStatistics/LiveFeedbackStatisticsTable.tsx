import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Tooltip, Typography } from '@mui/material';
import {
  AssessmentLiveFeedbackData,
  AssessmentLiveFeedbackStatistics,
  MainAssessmentInfo,
} from 'types/course/statistics/assessmentStatistics';

import SubmissionWorkflowState from 'course/assessment/submission/components/SubmissionWorkflowState';
import { workflowStates } from 'course/assessment/submission/constants';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import GhostIcon from 'lib/components/icons/GhostIcon';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import { getEditSubmissionURL } from 'lib/helpers/url-builders';
import useTranslation from 'lib/hooks/useTranslation';

import LiveFeedbackMetricSelector, {
  MetricType,
} from './components/LiveFeedbackMetricsSelector';
import { getClassnameForLiveFeedbackCell } from './classNameUtils';
import LiveFeedbackHistoryContent from './LiveFeedbackHistory';
import translations from './translations';
import { getJointGroupsName } from './utils';

interface MetricConfig {
  showTotal: boolean;
  legendLowerLabel: string;
  legendUpperLabel: string;
}

const METRIC_CONFIG: Record<MetricType, MetricConfig> = {
  [MetricType.GRADE]: {
    showTotal: true,
    legendLowerLabel: 'legendLowerLabelGrade',
    legendUpperLabel: 'legendUpperLabelGrade',
  },
  [MetricType.GRADE_DIFF]: {
    showTotal: true,
    legendLowerLabel: 'legendLowerLabelGradeDiff',
    legendUpperLabel: 'legendUpperLabelGradeDiff',
  },
  [MetricType.MESSAGES_SENT]: {
    showTotal: true,
    legendLowerLabel: 'legendLowerLabelMessagesSent',
    legendUpperLabel: 'legendUpperLabelMessagesSent',
  },
  [MetricType.WORD_COUNT]: {
    showTotal: true,
    legendLowerLabel: 'legendLowerLabelWordCount',
    legendUpperLabel: 'legendUpperLabelWordCount',
  },
} as const;

interface Props {
  includePhantom: boolean;
  assessmentStatistics: MainAssessmentInfo | null;
  liveFeedbackStatistics: AssessmentLiveFeedbackStatistics[];
}

const LiveFeedbackStatisticsTable: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { courseId, assessmentId } = useParams();
  const { includePhantom, assessmentStatistics, liveFeedbackStatistics } =
    props;
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const [parsedStatistics, setParsedStatistics] = useState<
    AssessmentLiveFeedbackStatistics[]
  >([]);
  const [upperQuartileMetricValue, setUpperQuartileMetricValue] =
    useState<number>(0);
  const [openLiveFeedbackHistory, setOpenLiveFeedbackHistory] = useState(false);
  const [liveFeedbackInfo, setLiveFeedbackInfo] = useState({
    courseUserId: 0,
    questionId: 0,
    questionNumber: 0,
  });
  const [selectedMetric, setSelectedMetric] = useState({
    value: MetricType.MESSAGES_SENT,
    label: 'Messages Sent',
  });

  useEffect(() => {
    // Create a deep copy of the statistics to avoid mutating the original data
    const processedStats = liveFeedbackStatistics.map((stat) => ({
      ...stat,
      liveFeedbackData: stat.liveFeedbackData.map((data) => ({
        ...data,
        [selectedMetric.value]: data[selectedMetric.value as keyof typeof data],
      })),
    }));

    // Calculate quartile value from all non-zero values
    const feedbackStats = processedStats
      .flatMap((s) =>
        s.liveFeedbackData.map((d) => {
          const val = d[selectedMetric.value as keyof typeof d];
          return typeof val === 'number' ? val : 0;
        }),
      )
      .filter((c) => c !== 0)
      .sort((a, b) => a - b);

    const upperQuartilePercentileIndex = Math.floor(
      0.75 * (feedbackStats.length - 1),
    );
    const upperQuartilePercentileValue =
      feedbackStats[upperQuartilePercentileIndex];
    setUpperQuartileMetricValue(upperQuartilePercentileValue);

    const filteredStats = includePhantom
      ? processedStats
      : processedStats.filter((s) => !s.courseUser.isPhantom);

    // Only calculate totals if the metric should show them
    if (
      METRIC_CONFIG[selectedMetric.value as keyof typeof METRIC_CONFIG]
        ?.showTotal
    ) {
      filteredStats.forEach((stat) => {
        stat.totalMetricCount = stat.liveFeedbackData.reduce((sum, data) => {
          const value = data[selectedMetric.value as keyof typeof data];
          return sum + (typeof value === 'number' ? value : 0);
        }, 0);
      });
    } else {
      // Clear any existing totals
      filteredStats.forEach((stat) => {
        stat.totalMetricCount = undefined;
      });
    }

    const sortedStats = filteredStats.sort((a, b) => {
      // First sort by phantom status
      const phantomDiff =
        Number(a.courseUser.isPhantom) - Number(b.courseUser.isPhantom);
      if (phantomDiff !== 0) return phantomDiff;

      // Then sort by workflow state
      const workflowStateOrder = {
        [workflowStates.Published]: 0,
        [workflowStates.Graded]: 1,
        [workflowStates.Submitted]: 2,
        [workflowStates.Attempting]: 3,
        [workflowStates.Unstarted]: 4,
      };
      const stateA =
        workflowStateOrder[a.workflowState ?? workflowStates.Unstarted] ?? 5;
      const stateB =
        workflowStateOrder[b.workflowState ?? workflowStates.Unstarted] ?? 5;
      if (stateA !== stateB) return stateA - stateB;

      // Then sort by total metric count
      const feedbackDiff =
        (b.totalMetricCount ?? 0) - (a.totalMetricCount ?? 0);
      if (feedbackDiff !== 0) return feedbackDiff;

      // Finally sort by name
      return a.courseUser.name.localeCompare(b.courseUser.name);
    });

    setParsedStatistics(sortedStats);
  }, [liveFeedbackStatistics, includePhantom, selectedMetric]);

  const renderTooltipContent = (
    liveFeedbackData: AssessmentLiveFeedbackData,
  ): ReactNode => (
    <Box>
      <Typography variant="body2">
        Grade: {liveFeedbackData.grade ?? '-'}
      </Typography>
      <Typography variant="body2">
        Grade Improvement: {liveFeedbackData.grade_diff ?? '-'}
      </Typography>
      <Typography variant="body2">
        Messages Sent: {liveFeedbackData.messages_sent ?? '-'}
      </Typography>
      <Typography variant="body2">
        Word Count: {liveFeedbackData.word_count ?? '-'}
      </Typography>
    </Box>
  );

  const renderClickableCell = (
    metricValue: number,
    classname: string,
    courseUserId: number,
    questionId: number,
    questionNumber: number,
  ): JSX.Element => (
    <div
      className={`cursor-pointer ${classname}`}
      onClick={(): void => {
        setOpenLiveFeedbackHistory(true);
        setLiveFeedbackInfo({ courseUserId, questionId, questionNumber });
      }}
    >
      {metricValue}
    </div>
  );

  // the case where the live feedback count is null is handled separately inside the column
  // (refer to the definition of statColumns below)
  const renderNonNullClickableLiveFeedbackCountCell = (
    metricValue: number,
    courseUserId: number,
    questionId: number,
    questionNumber: number,
    liveFeedbackData: AssessmentLiveFeedbackData,
  ): ReactNode => {
    const classname = getClassnameForLiveFeedbackCell(
      metricValue,
      upperQuartileMetricValue,
    );

    const tooltipContent = renderTooltipContent(liveFeedbackData);

    // If there is no LiveFeedbackHistory, we do not show the clickable cell
    if (liveFeedbackData.messages_sent === 0) {
      return (
        <div className="p-1.5">
          <Tooltip arrow placement="left" title={tooltipContent}>
            <span>{metricValue ?? '-'}</span>
          </Tooltip>
        </div>
      );
    }

    return (
      <Tooltip arrow placement="left" title={tooltipContent}>
        {renderClickableCell(
          metricValue,
          classname,
          courseUserId,
          questionId,
          questionNumber,
        )}
      </Tooltip>
    );
  };

  const columns: ColumnTemplate<AssessmentLiveFeedbackStatistics>[] =
    useMemo(() => {
      const statColumns = Array.from(
        { length: assessmentStatistics?.questionCount ?? 0 },
        (_, index) => {
          return {
            searchProps: {
              getValue: (datum) =>
                datum.liveFeedbackData[index]?.[
                  selectedMetric.value as keyof (typeof datum.liveFeedbackData)[number]
                ]?.toString() ?? '',
            },
            title: t(translations.questionIndex, { index: index + 1 }),
            cell: (datum): ReactNode => {
              const metricValue =
                datum.liveFeedbackData[index]?.[
                  selectedMetric.value as keyof typeof datum.liveFeedbackData
                ];
              return typeof metricValue === 'number'
                ? renderNonNullClickableLiveFeedbackCountCell(
                    metricValue,
                    datum.courseUser.id,
                    datum.questionIds[index],
                    index + 1,
                    datum.liveFeedbackData[index],
                  )
                : '-';
            },
            sortable: true,
            csvDownloadable: true,
            className: 'text-right',
            sortProps: {
              sort: (a, b): number => {
                const aValue =
                  a.liveFeedbackData[index]?.[
                    selectedMetric.value as keyof (typeof a.liveFeedbackData)[number]
                  ] ?? Number.MIN_SAFE_INTEGER;
                const bValue =
                  b.liveFeedbackData[index]?.[
                    selectedMetric.value as keyof (typeof b.liveFeedbackData)[number]
                  ] ?? Number.MIN_SAFE_INTEGER;
                return aValue - bValue;
              },
            },
          };
        },
        selectedMetric,
      );

      const baseColumns: ColumnTemplate<AssessmentLiveFeedbackStatistics>[] = [
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
          className: 'hidden',
          cell: (datum) => (
            <div className="flex grow items-center">
              {datum.courseUser.email}
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
      ];

      // Always add total column, but make it empty when showTotal is false to prevent UI elements shifting
      baseColumns.push({
        searchProps: {
          getValue: (datum) =>
            METRIC_CONFIG[selectedMetric.value as keyof typeof METRIC_CONFIG]
              ?.showTotal
              ? datum.liveFeedbackData
                  .reduce((sum, data) => {
                    const value =
                      data[selectedMetric.value as keyof typeof data];
                    return sum + (typeof value === 'number' ? value : 0);
                  }, 0)
                  .toString()
              : '',
        },
        title: t(translations.total),
        cell: (datum): ReactNode => {
          if (
            !METRIC_CONFIG[selectedMetric.value as keyof typeof METRIC_CONFIG]
              ?.showTotal
          ) {
            return <Box>-</Box>;
          }

          const totalMetricValue = datum.liveFeedbackData.reduce(
            (sum, data) => {
              const value = data[selectedMetric.value as keyof typeof data];
              return sum + (typeof value === 'number' ? value : 0);
            },
            0,
          );

          return <Box>{totalMetricValue}</Box>;
        },
        sortable: true,
        csvDownloadable: true,
        className: 'text-right',
        sortProps: {
          sort: (a, b): number => {
            if (
              !METRIC_CONFIG[selectedMetric.value as keyof typeof METRIC_CONFIG]
                ?.showTotal
            ) {
              return 0;
            }
            const totalA = a.totalMetricCount ?? 0;
            const totalB = b.totalMetricCount ?? 0;
            return totalA - totalB;
          },
        },
      });

      return baseColumns;
    }, [selectedMetric.value, upperQuartileMetricValue]);

  return (
    <>
      <div className="flex mb-4 w-full">
        <div className="w-1/2 flex items-center">
          <LiveFeedbackMetricSelector
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
          />
        </div>

        <div className="w-1/2 flex items-center justify-end">
          <Typography variant="caption">
            {t(
              translations[
                METRIC_CONFIG[
                  selectedMetric.value as keyof typeof METRIC_CONFIG
                ].legendLowerLabel
              ],
            )}
          </Typography>
          <div className="h-5 w-1/4 mx-2 bg-gradient-to-r from-green-100 to-green-500" />
          <Typography variant="caption">
            {t(
              translations[
                METRIC_CONFIG[
                  selectedMetric.value as keyof typeof METRIC_CONFIG
                ].legendUpperLabel
              ],
            )}
          </Typography>
        </div>
      </div>

      <Table
        className="-m-6"
        columns={columns}
        csvDownload={{
          filename: t(translations.liveFeedbackFilename, {
            assessment: assessmentStatistics?.title ?? '',
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
