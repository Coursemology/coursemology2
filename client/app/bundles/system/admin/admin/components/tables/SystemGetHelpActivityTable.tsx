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
  getAssessmentURL,
  getCourseURL,
  getEditSubmissionQuestionURL,
} from 'lib/helpers/url-builders';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';

import assessmentStatisticsTranslations from '../../../../../course/assessment/pages/AssessmentStatistics/translations';

const translations = defineMessages({
  studentName: {
    id: 'system.admin.admin.components.tables.SystemGetHelpActivityTable.studentName',
    defaultMessage: 'Name',
  },
  messageCount: {
    id: 'system.admin.admin.components.tables.SystemGetHelpActivityTable.messageCount',
    defaultMessage: '# Msgs',
  },
  lastMessage: {
    id: 'system.admin.admin.components.tables.SystemGetHelpActivityTable.lastMessage',
    defaultMessage: 'Last Message',
  },
  questionNumber: {
    id: 'system.admin.admin.components.tables.SystemGetHelpActivityTable.questionNumber',
    defaultMessage: 'Question',
  },
  assessmentTitle: {
    id: 'system.admin.admin.components.tables.SystemGetHelpActivityTable.assessmentTitle',
    defaultMessage: 'Assessment',
  },
  createdAt: {
    id: 'system.admin.admin.components.tables.SystemGetHelpActivityTable.createdAt',
    defaultMessage: 'Last Message At',
  },
  courseTitle: {
    id: 'system.admin.admin.components.tables.SystemGetHelpActivityTable.courseTitle',
    defaultMessage: 'Course',
  },
  instanceTitle: {
    id: 'system.admin.admin.components.tables.SystemGetHelpActivityTable.instanceTitle',
    defaultMessage: 'Instance',
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
    instanceHost: '',
  });

  const columns: ColumnTemplate<SystemGetHelpActivity>[] = [
    {
      of: 'instanceTitle',
      title: t(translations.instanceTitle),
      sortable: true,
      searchable: true,
      cell: (getHelpDatum) => (
        <Link
          key={getHelpDatum.id}
          href={`//${getHelpDatum.instanceHost}/admin/get_help`}
          opensInNewTab
        >
          {getHelpDatum.instanceTitle}
        </Link>
      ),
    },
    {
      of: 'courseTitle',
      title: t(translations.courseTitle),
      sortable: true,
      searchable: true,
      cell: (getHelpDatum) => (
        <Link
          key={getHelpDatum.id}
          href={`//${getHelpDatum.instanceHost}${getCourseURL(getHelpDatum.courseId)}`}
          opensInNewTab
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
          href={`//${getHelpDatum.instanceHost}${getAssessmentURL(
            getHelpDatum.courseId,
            getHelpDatum.assessmentId,
          )}`}
          opensInNewTab
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
          href={`//${getHelpDatum.instanceHost}${getEditSubmissionQuestionURL(
            getHelpDatum.courseId,
            getHelpDatum.assessmentId,
            getHelpDatum.submissionId,
            getHelpDatum.questionNumber,
          )}`}
          opensInNewTab
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
        <Link
          key={getHelpDatum.id}
          href={`//${getHelpDatum.instanceHost}${getHelpDatum.nameLink}`}
          opensInNewTab
        >
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
                instanceHost: getHelpDatum.instanceHost,
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
      className: NUM_CELL_CLASS_NAME,
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
          instanceHost={systemLevelGetHelpInfo.instanceHost}
          questionId={systemLevelGetHelpInfo.questionId}
          questionNumber={systemLevelGetHelpInfo.questionNumber}
        />
      </Prompt>
    </div>
  );
};

export default SystemGetHelpActivityTable;
