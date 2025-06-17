import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Tooltip } from '@mui/material';

import LiveFeedbackHistoryContent from 'course/assessment/pages/AssessmentStatistics/LiveFeedbackHistory';
import { SystemGetHelpActivity } from 'course/statistics/types';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  NUM_CELL_CLASS_NAME,
} from 'lib/constants/sharedConstants';
import {
  getCourseURL,
  getEditSubmissionQuestionURL,
  getEditSubmissionURL,
} from 'lib/helpers/url-builders';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';

import assessmentStatisticsTranslations from '../../../../../course/assessment/pages/AssessmentStatistics/translations';

const translations = defineMessages({
  header: {
    id: 'system.admin.admin.pages.SystemGetHelpActivityIndex.header',
    defaultMessage: 'Get Help',
  },
  tableTitle: {
    id: 'course.statistics.StatisticsIndex.getHelp.tableTitle',
    defaultMessage: 'Recent Get Help Activity',
  },
  studentName: {
    id: 'course.statistics.StatisticsIndex.getHelp.name',
    defaultMessage: 'Name',
  },
  messageCount: {
    id: 'course.statistics.StatisticsIndex.getHelp.messageCount',
    defaultMessage: '# Msgs',
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
  courseTitle: {
    id: 'course.statistics.StatisticsIndex.getHelp.courseTitle',
    defaultMessage: 'Course',
  },
  instanceTitle: {
    id: 'course.statistics.StatisticsIndex.getHelp.instanceTitle',
    defaultMessage: 'Instance',
  },
  searchBar: {
    id: 'course.statistics.StatisticsIndex.getHelp.searchBar',
    defaultMessage: 'Search by Student Name, Question, or Assessment',
  },
});

interface SystemGetHelpActivityTableProps {
  getHelpData: SystemGetHelpActivity[];
}

const SystemGetHelpActivityTable: FC<SystemGetHelpActivityTableProps> = ({
  getHelpData,
}) => {
  const { t } = useTranslation();
  const [openLiveFeedbackHistory, setOpenLiveFeedbackHistory] = useState(false);
  const [systemLevelGetHelpInfo, setSystemLevelGetHelpInfo] = useState({
    courseId: 0,
    courseUserId: 0,
    questionId: 0,
    questionNumber: 0,
    assessmentId: 0,
  });

  const columns: ColumnTemplate<SystemGetHelpActivity>[] = [
    {
      of: 'courseTitle',
      title: t(translations.courseTitle),
      sortable: true,
      searchable: true,
      cell: (getHelpDatum) => (
        <Link
          key={getHelpDatum.id}
          opensInNewTab
          to={getCourseURL(getHelpDatum.courseId)}
        >
          {getHelpDatum.courseTitle}
        </Link>
      ),
    },
    {
      of: 'assessmentTitle',
      title: t(translations.assessmentTitle),
      sortable: true,
      searchable: true,
      cell: (getHelpDatum) => (
        <Link
          key={getHelpDatum.id}
          opensInNewTab
          to={getEditSubmissionURL(
            getHelpDatum.courseId,
            getHelpDatum.assessmentId,
            getHelpDatum.submissionId,
          )}
        >
          {getHelpDatum.assessmentTitle}
        </Link>
      ),
    },
    {
      of: 'questionNumber',
      title: t(translations.questionNumber),
      sortable: true,
      searchable: true,
      cell: (getHelpDatum) => (
        <Link
          key={getHelpDatum.id}
          opensInNewTab
          to={getEditSubmissionQuestionURL(
            getHelpDatum.courseId,
            getHelpDatum.assessmentId,
            getHelpDatum.submissionId,
            getHelpDatum.questionNumber,
          )}
        >
          Question {getHelpDatum.questionNumber}
          {getHelpDatum.questionTitle ? `: ${getHelpDatum.questionTitle}` : ''}
        </Link>
      ),
    },
    {
      of: 'name',
      title: t(translations.studentName),
      sortable: true,
      searchable: true,
      cell: (getHelpDatum) => (
        <Link key={getHelpDatum.id} opensInNewTab to={getHelpDatum.nameLink}>
          {getHelpDatum.name}
        </Link>
      ),
    },
    {
      of: 'messageCount',
      title: t(translations.messageCount),
      sortable: true,
      searchable: true,
      cell: (getHelpDatum) => (
        <div className={NUM_CELL_CLASS_NAME}>
          <Link
            key={getHelpDatum.id}
            className="cursor-pointer"
            onClick={(e): void => {
              e.preventDefault();
              setOpenLiveFeedbackHistory(true);
              setSystemLevelGetHelpInfo({
                courseId: getHelpDatum.courseId,
                courseUserId: getHelpDatum.courseUserId,
                questionId: getHelpDatum.questionId,
                questionNumber: getHelpDatum.questionNumber,
                assessmentId: getHelpDatum.assessmentId,
              });
            }}
          >
            {getHelpDatum.messageCount}
          </Link>
        </div>
      ),
    },
    {
      of: 'createdAt',
      title: t(translations.createdAt),
      sortable: true,
      cell: (getHelpDatum) => formatMiniDateTime(getHelpDatum.createdAt),
    },
    {
      of: 'lastMessage',
      title: t(translations.lastMessage),
      sortable: true,
      searchable: true,
      cell: (getHelpDatum) => (
        <Tooltip arrow placement="top" title={getHelpDatum.lastMessage}>
          <div className="line-clamp-1 overflow-hidden text-ellipsis">
            {getHelpDatum.lastMessage}
          </div>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="m-6">
      <Table
        className="border-none"
        columns={columns}
        data={getHelpData}
        getRowClassName={(getHelpDatum): string =>
          `get_help_${getHelpDatum.id}`
        }
        getRowEqualityData={(getHelpDatum): SystemGetHelpActivity =>
          getHelpDatum
        }
        getRowId={(getHelpDatum): string => getHelpDatum.id.toString()}
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
          assessmentId={systemLevelGetHelpInfo.assessmentId}
          courseId={systemLevelGetHelpInfo.courseId}
          courseUserId={systemLevelGetHelpInfo.courseUserId}
          questionId={systemLevelGetHelpInfo.questionId}
          questionNumber={systemLevelGetHelpInfo.questionNumber}
        />
      </Prompt>
    </div>
  );
};

export default SystemGetHelpActivityTable;
