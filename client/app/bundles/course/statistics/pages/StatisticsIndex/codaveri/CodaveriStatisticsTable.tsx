import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Tooltip, Typography } from '@mui/material';

import { CodaveriLiveFeedbackActivity } from 'course/statistics/types';
import Link from 'lib/components/core/Link';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  NUM_CELL_CLASS_NAME,
} from 'lib/constants/sharedConstants';
import {
  getEditSubmissionQuestionURL,
  getEditSubmissionURL,
} from 'lib/helpers/url-builders';
import assessmentStatisticsTranslations from '../../../../assessment/pages/AssessmentStatistics/translations';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';
import Prompt from 'lib/components/core/dialogs/Prompt';
import LiveFeedbackHistoryIndex from 'course/assessment/pages/AssessmentStatistics/LiveFeedbackHistory';

const translations = defineMessages({
  tableTitle: {
    id: 'course.statistics.StatisticsIndex.codaveri.tableTitle',
    defaultMessage: 'Recent Live Feedback (last 7 days)',
  },
  studentName: {
    id: 'course.statistics.StatisticsIndex.codaveri.name',
    defaultMessage: 'Name',
  },
  messageCount: {
    id: 'course.statistics.StatisticsIndex.codaveri.messageCount',
    defaultMessage: '# Messages',
  },
  lastMessage: {
    id: 'course.statistics.StatisticsIndex.codaveri.lastMessage',
    defaultMessage: 'Last Message',
  },
  questionNumber: {
    id: 'course.statistics.StatisticsIndex.codaveri.questionNumber',
    defaultMessage: 'Question',
  },
  assessmentTitle: {
    id: 'course.statistics.StatisticsIndex.codaveri.assessmentTitle',
    defaultMessage: 'Assessment',
  },
  createdAt: {
    id: 'course.statistics.StatisticsIndex.codaveri.createdAt',
    defaultMessage: 'Last Message At',
  },
  searchBar: {
    id: 'course.statistics.StatisticsIndex.codaveri.searchBar',
    defaultMessage: 'Search by Student Name, Question, or Assessment',
  },
});

const CodaveriStatisticsTable: FC<{
  liveFeedbacks: CodaveriLiveFeedbackActivity[];
}> = ({ liveFeedbacks }) => {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const [openLiveFeedbackHistory, setOpenLiveFeedbackHistory] = useState(false);
  const [courseLevelLiveFeedbackInfo, setCourseLevelLiveFeedbackInfo] =
    useState({
      courseUserId: 0,
      questionId: 0,
      questionNumber: 0,
      assessmentId: 0,
    });

  const columns: ColumnTemplate<CodaveriLiveFeedbackActivity>[] = [
    {
      of: 'assessmentTitle',
      title: t(translations.assessmentTitle),
      sortable: true,
      searchable: true,
      cell: (feedback) => (
        <Link
          key={feedback.id}
          opensInNewTab
          to={getEditSubmissionURL(
            courseId,
            feedback.assessmentId,
            feedback.submissionId,
          )}
        >
          {feedback.assessmentTitle}
        </Link>
      ),
    },
    {
      of: 'questionNumber',
      title: t(translations.questionNumber),
      sortable: true,
      searchable: true,
      cell: (feedback) => (
        <Link
          key={feedback.id}
          opensInNewTab
          to={getEditSubmissionQuestionURL(
            courseId,
            feedback.assessmentId,
            feedback.submissionId,
            feedback.questionNumber,
          )}
        >
          Question {feedback.questionNumber}
          {feedback.questionTitle ? `: ${feedback.questionTitle}` : ''}
        </Link>
      ),
    },
    {
      of: 'name',
      title: t(translations.studentName),
      sortable: true,
      searchable: true,
      cell: (feedback) => (
        <Link key={feedback.id} opensInNewTab to={feedback.nameLink}>
          {feedback.name}
        </Link>
      ),
    },
    {
      of: 'messageCount',
      title: t(translations.messageCount),
      sortable: true,
      searchable: true,
      cell: (feedback) => (
        <div className={NUM_CELL_CLASS_NAME}>
          <Link
            key={feedback.id}
            className="cursor-pointer"
            onClick={(e): void => {
              e.preventDefault();
              setOpenLiveFeedbackHistory(true);
              setCourseLevelLiveFeedbackInfo({
                courseUserId: feedback.userId,
                questionId: feedback.questionId,
                questionNumber: feedback.questionNumber,
                assessmentId: feedback.assessmentId,
              });
            }}
          >
            {feedback.messageCount}
          </Link>
        </div>
      ),
    },
    {
      of: 'createdAt',
      title: t(translations.createdAt),
      sortable: true,
      cell: (feedback) => formatMiniDateTime(feedback.createdAt),
    },
    {
      of: 'lastMessage',
      title: t(translations.lastMessage),
      sortable: true,
      searchable: true,
      cell: (feedback) => (
        <Tooltip arrow placement="top" title={feedback.lastMessage}>
          <div className="line-clamp-1 overflow-hidden text-ellipsis">
            {feedback.lastMessage}
          </div>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Typography className="ml-6" variant="h6">
        {t(translations.tableTitle)}
      </Typography>
      <Table
        className="border-none"
        columns={columns}
        data={liveFeedbacks}
        getRowClassName={(feedback): string =>
          `codaveri_feedback_${feedback.id}`
        }
        getRowEqualityData={(feedback): CodaveriLiveFeedbackActivity =>
          feedback
        }
        getRowId={(feedback): string => feedback.id.toString()}
        indexing={{ indices: true }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
        }}
        search={{
          searchPlaceholder: t(translations.searchBar),
          searchProps: {
            shouldInclude: (feedback, filterValue?: string): boolean => {
              if (!filterValue) return true;

              return (
                feedback.name
                  .toLowerCase()
                  .trim()
                  .includes(filterValue.toLowerCase().trim()) ||
                feedback.questionNumber
                  .toString()
                  .trim()
                  .includes(filterValue.toLowerCase().trim()) ||
                feedback.assessmentTitle
                  .toLowerCase()
                  .trim()
                  .includes(filterValue.toLowerCase().trim())
              );
            },
          },
        }}
      />
      <Prompt
        cancelLabel={t(assessmentStatisticsTranslations.closePrompt)}
        maxWidth="lg"
        onClose={(): void => setOpenLiveFeedbackHistory(false)}
        open={openLiveFeedbackHistory}
        title={t(
          assessmentStatisticsTranslations.liveFeedbackHistoryPromptTitle,
        )}
      >
        <LiveFeedbackHistoryIndex
          courseUserId={courseLevelLiveFeedbackInfo.courseUserId}
          questionId={courseLevelLiveFeedbackInfo.questionId}
          questionNumber={courseLevelLiveFeedbackInfo.questionNumber}
          assessmentId={courseLevelLiveFeedbackInfo.assessmentId}
        />
      </Prompt>
    </>
  );
};

export default CodaveriStatisticsTable;
