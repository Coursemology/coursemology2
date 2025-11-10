import { FC, useState } from 'react';
import { Tooltip } from '@mui/material';

import LiveFeedbackHistoryContent from 'course/assessment/pages/AssessmentStatistics/LiveFeedbackHistory';
import assessmentStatisticsTranslations from 'course/assessment/pages/AssessmentStatistics/translations';
import { InstanceGetHelpActivity } from 'course/statistics/types';
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
import translations from 'lib/translations/getHelp';

interface InstanceGetHelpActivityTableProps {
  getHelpData: InstanceGetHelpActivity[];
}

const InstanceGetHelpActivityTable: FC<InstanceGetHelpActivityTableProps> = ({
  getHelpData,
}) => {
  const { t } = useTranslation();
  const [openLiveFeedbackHistory, setOpenLiveFeedbackHistory] = useState(false);
  const [instanceLevelGetHelpInfo, setInstanceLevelGetHelpInfo] = useState({
    courseUserId: 0,
    questionId: 0,
    questionNumber: 0,
    assessmentId: 0,
    courseId: 0,
  });

  const columns: ColumnTemplate<InstanceGetHelpActivity>[] = [
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
          to={getAssessmentURL(
            getHelpDatum.courseId,
            getHelpDatum.assessmentId,
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
              setInstanceLevelGetHelpInfo({
                courseUserId: getHelpDatum.courseUserId,
                questionId: getHelpDatum.questionId,
                questionNumber: getHelpDatum.questionNumber,
                assessmentId: getHelpDatum.assessmentId,
                courseId: getHelpDatum.courseId,
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
    <>
      <Table
        className="border-none"
        columns={columns}
        data={getHelpData}
        getRowClassName={(getHelpDatum): string =>
          `get_help_${getHelpDatum.id}`
        }
        getRowEqualityData={(getHelpDatum): InstanceGetHelpActivity =>
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
          assessmentId={instanceLevelGetHelpInfo.assessmentId}
          courseId={instanceLevelGetHelpInfo.courseId}
          courseUserId={instanceLevelGetHelpInfo.courseUserId}
          questionId={instanceLevelGetHelpInfo.questionId}
          questionNumber={instanceLevelGetHelpInfo.questionNumber}
        />
      </Prompt>
    </>
  );
};

export default InstanceGetHelpActivityTable;
