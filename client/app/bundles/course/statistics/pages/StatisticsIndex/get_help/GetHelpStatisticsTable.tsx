import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Tooltip, Typography } from '@mui/material';

import LiveFeedbackHistoryContent from 'course/assessment/pages/AssessmentStatistics/LiveFeedbackHistory';
import { GetHelpActivity } from 'course/statistics/types';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  NUM_CELL_CLASS_NAME,
} from 'lib/constants/sharedConstants';
import {
  getAssessmentURL,
  getEditSubmissionQuestionURL,
} from 'lib/helpers/url-builders';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';

import assessmentStatisticsTranslations from '../../../../assessment/pages/AssessmentStatistics/translations';

const translations = defineMessages({
  tableTitle: {
    id: 'course.statistics.StatisticsIndex.getHelp.tableTitle',
    defaultMessage: 'Recent Get Help Activity (last 7 days)',
  },
  studentName: {
    id: 'course.statistics.StatisticsIndex.getHelp.name',
    defaultMessage: 'Name',
  },
  messageCount: {
    id: 'course.statistics.StatisticsIndex.getHelp.messageCount',
    defaultMessage: '# Messages',
  },
  lastMessage: {
    id: 'course.statistics.StatisticsIndex.getHelp.lastMessage',
    defaultMessage: 'Last Message',
  },
  questionNumber: {
    id: 'course.statistics.StatisticsIndex.getHelp.questionNumber',
    defaultMessage: 'Question',
  },
  assessmentTitle: {
    id: 'course.statistics.StatisticsIndex.getHelp.assessmentTitle',
    defaultMessage: 'Assessment',
  },
  createdAt: {
    id: 'course.statistics.StatisticsIndex.getHelp.createdAt',
    defaultMessage: 'Last Message At',
  },
  searchBar: {
    id: 'course.statistics.StatisticsIndex.getHelp.searchBar',
    defaultMessage: 'Search by Student Name, Question, or Assessment',
  },
});

const GetHelpStatisticsTable: FC<{
  liveFeedbacks: GetHelpActivity[];
}> = ({ liveFeedbacks }) => {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const [openLiveFeedbackHistory, setOpenLiveFeedbackHistory] = useState(false);
  const [courseLevelGetHelpInfo, setCourseLevelGetHelpInfo] = useState({
    courseUserId: 0,
    questionId: 0,
    questionNumber: 0,
    assessmentId: 0,
  });

  const columns: ColumnTemplate<GetHelpActivity>[] = [
    {
      of: 'assessmentTitle',
      title: t(translations.assessmentTitle),
      sortable: true,
      searchable: true,
      cell: (feedback) => (
        <Link
          key={feedback.id}
          opensInNewTab
          to={getAssessmentURL(courseId, feedback.assessmentId)}
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
              setCourseLevelGetHelpInfo({
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
        getRowClassName={(feedback): string => `get_help_${feedback.id}`}
        getRowEqualityData={(feedback): GetHelpActivity => feedback}
        getRowId={(feedback): string => feedback.id.toString()}
        indexing={{ indices: true }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
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
        <LiveFeedbackHistoryContent
          assessmentId={courseLevelGetHelpInfo.assessmentId}
          courseUserId={courseLevelGetHelpInfo.courseUserId}
          questionId={courseLevelGetHelpInfo.questionId}
          questionNumber={courseLevelGetHelpInfo.questionNumber}
        />
      </Prompt>
    </>
  );
};

export default GetHelpStatisticsTable;
