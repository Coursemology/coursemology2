import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Block } from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Chip,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import palette from 'theme/palette';
import { SubmissionMiniEntity } from 'types/course/assessment/submissions';

import assessmentTranslations from 'course/assessment/translations';
import CustomTooltip from 'lib/components/core/CustomTooltip';
import TableContainer from 'lib/components/core/layouts/TableContainer';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { getAssessmentURL, getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';

import SubmissionsTableButton from '../buttons/SubmissionsTableButton';

interface Props {
  isGamified: boolean;
  submissions: SubmissionMiniEntity[];
  isPendingTab: boolean;
  tableIsLoading: boolean;
  rowsPerPage: number;
  pageNum: number;
}

const translations = defineMessages({
  noSubmissionsMessage: {
    id: 'course.assessment.submissions.SubmissionsTable.noSubmissionsMessage',
    defaultMessage: 'There are no submissions',
  },
  tableHeaderSn: {
    id: 'course.assessment.submissions.SubmissionsTable.tableHeaderSn',
    defaultMessage: 'S/N',
  },
  tableHeaderName: {
    id: 'course.assessment.submissions.SubmissionsTable.tableHeaderName',
    defaultMessage: 'Name',
  },
  tableHeaderTitle: {
    id: 'course.assessment.submissions.SubmissionsTable.tableHeaderTitle',
    defaultMessage: 'Title',
  },
  tableHeaderSubmittedAt: {
    id: 'course.assessment.submissions.SubmissionsTable.tableHeaderSubmittedAt',
    defaultMessage: 'Submitted At',
  },
  tableHeaderStatus: {
    id: 'course.assessment.submissions.SubmissionsTable.tableHeaderStatus',
    defaultMessage: 'Status',
  },
  tableHeaderTutor: {
    id: 'course.assessment.submissions.SubmissionsTable.tableHeaderTutor',
    defaultMessage: 'Tutor',
  },
  tableHeaderTotalGrade: {
    id: 'course.assessment.submissions.SubmissionsTable.tableHeaderTotalGrade',
    defaultMessage: 'Grade',
  },
  tableHeaderExp: {
    id: 'course.assessment.submissions.SubmissionsTable.tableHeaderExp',
    defaultMessage: 'EXP',
  },
  gradeTooltip: {
    id: 'course.assessment.submissions.SubmissionsTable.gradeTooltip',
    defaultMessage:
      "These grades can't be seen by the student until they are published",
  },
});

const statusTranslations = {
  attempting: 'Attempting',
  submitted: 'Submitted',
  graded: 'Graded, unpublished',
  published: 'Graded',
  unknown: 'Unknown status, please contact administrator',
};

const translateStatus: (var1: string) => string = (oldStatus) => {
  switch (oldStatus) {
    case 'attempting':
      return statusTranslations.attempting;
    case 'submitted':
      return statusTranslations.submitted;
    case 'graded':
      return statusTranslations.graded;
    case 'published':
      return statusTranslations.published;
    default:
      return statusTranslations.unknown;
  }
};

const SubmissionsTable: FC<Props> = (props) => {
  const {
    isGamified,
    submissions,
    isPendingTab,
    tableIsLoading,
    rowsPerPage,
    pageNum,
  } = props;

  const { t } = useTranslation();

  if (tableIsLoading) {
    return <LoadingIndicator />;
  }

  if (submissions.length === 0)
    return <Note message={t(translations.noSubmissionsMessage)} />;

  return (
    <TableContainer dense variant="bare">
      <TableHead>
        <TableRow>
          <TableCell align="center">{t(translations.tableHeaderSn)}</TableCell>
          <TableCell>{t(translations.tableHeaderName)}</TableCell>
          <TableCell>{t(translations.tableHeaderTitle)}</TableCell>
          <TableCell align="center">
            {t(translations.tableHeaderSubmittedAt)}
          </TableCell>
          <TableCell align="center">
            {t(translations.tableHeaderStatus)}
          </TableCell>
          {isPendingTab && (
            <TableCell>{t(translations.tableHeaderTutor)}</TableCell>
          )}
          <TableCell align="center">
            {t(translations.tableHeaderTotalGrade)}
          </TableCell>
          {isGamified && (
            <TableCell align="center">
              {t(translations.tableHeaderExp)}
            </TableCell>
          )}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {submissions.map((submission, index) => (
          <TableRow
            key={`submission_${submission.id}`}
            className="submission"
            id={`submission_${submission.id}`}
          >
            <TableCell align="center">
              {index + 1 + (pageNum - 1) * rowsPerPage}
            </TableCell>
            <TableCell>
              <Link
                to={getCourseUserURL(getCourseId(), submission.courseUserId)}
                underline="hover"
              >
                {submission.courseUserName}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                to={getAssessmentURL(getCourseId(), submission.assessmentId)}
                underline="hover"
              >
                {submission.assessmentTitle}
              </Link>
              {!submission.assessmentPublished && (
                <Tooltip
                  disableInteractive
                  title={t(assessmentTranslations.draftHint)}
                >
                  <Chip
                    className="ml-2"
                    color="warning"
                    icon={<Block />}
                    label={t(assessmentTranslations.draft)}
                    size="small"
                    variant="outlined"
                  />
                </Tooltip>
              )}
            </TableCell>
            <TableCell align="center">
              {formatMiniDateTime(submission.submittedAt)}
            </TableCell>
            <TableCell align="center">
              <Chip
                label={translateStatus(submission.status)}
                style={{
                  width: 100,
                  backgroundColor: palette.submissionStatus[submission.status],
                }}
              />
            </TableCell>
            {isPendingTab && (
              <TableCell>
                {submission.teachingStaff?.length !== 0 ? (
                  <Stack>
                    {submission.teachingStaff?.map((staff) => (
                      <Link
                        key={staff.teachingStaffId}
                        to={getCourseUserURL(
                          getCourseId(),
                          staff.teachingStaffId,
                        )}
                        underline="hover"
                      >
                        {staff.teachingStaffName}
                      </Link>
                    ))}
                  </Stack>
                ) : (
                  <div>--</div>
                )}
              </TableCell>
            )}

            <TableCell align="center">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div>
                  {`${
                    submission.permissions.canSeeGrades &&
                    submission.currentGrade
                      ? submission.currentGrade
                      : '--'
                  } / ${submission.maxGrade}`}
                </div>
                {submission.permissions.canSeeGrades &&
                  submission.isGradedNotPublished && (
                    <CustomTooltip title={t(translations.gradeTooltip)}>
                      <ErrorIcon
                        color="error"
                        fontSize="small"
                        style={{ marginLeft: 5, marginTop: -4 }}
                      />
                    </CustomTooltip>
                  )}
              </div>
            </TableCell>

            {isGamified && (
              <TableCell align="center">
                {submission.pointsAwarded && submission.permissions.canSeeGrades
                  ? submission.pointsAwarded
                  : '-'}
              </TableCell>
            )}
            <TableCell>
              <SubmissionsTableButton
                assessmentId={submission.assessmentId}
                canGrade={submission.permissions.canGrade}
                submissionId={submission.id}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
};

export default SubmissionsTable;
