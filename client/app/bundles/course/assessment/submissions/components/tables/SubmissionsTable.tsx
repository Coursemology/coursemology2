import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Chip,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import palette from 'theme/palette';
import { SubmissionMiniEntity } from 'types/course/assessment/submissions';

import CustomTooltip from 'lib/components/core/CustomTooltip';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getAssessmentURL, getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatMiniDateTime } from 'lib/moment';

import SubmissionsTableButton from '../buttons/SubmissionsTableButton';

interface Props extends WrappedComponentProps {
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
    defaultMessage: 'Total Grade',
  },
  tableHeaderExp: {
    id: 'course.assessment.submissions.SubmissionsTable.tableHeaderExp',
    defaultMessage: 'Exp Awarded',
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
    intl,
    isGamified,
    submissions,
    isPendingTab,
    tableIsLoading,
    rowsPerPage,
    pageNum,
  } = props;

  if (tableIsLoading) {
    return <LoadingIndicator />;
  }

  if (submissions.length === 0) {
    return (
      <div style={{ marginTop: 10 }}>
        {intl.formatMessage(translations.noSubmissionsMessage)}
      </div>
    );
  }

  return (
    <Table sx={{ marginBottom: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell align="center">
            {intl.formatMessage(translations.tableHeaderSn)}
          </TableCell>
          <TableCell>
            {intl.formatMessage(translations.tableHeaderName)}
          </TableCell>
          <TableCell>
            {intl.formatMessage(translations.tableHeaderTitle)}
          </TableCell>
          <TableCell align="center">
            {intl.formatMessage(translations.tableHeaderSubmittedAt)}
          </TableCell>
          <TableCell align="center">
            {intl.formatMessage(translations.tableHeaderStatus)}
          </TableCell>
          {isPendingTab && (
            <TableCell>
              {intl.formatMessage(translations.tableHeaderTutor)}
            </TableCell>
          )}
          <TableCell align="center">
            {intl.formatMessage(translations.tableHeaderTotalGrade)}
          </TableCell>
          {isGamified && (
            <TableCell align="center">
              {intl.formatMessage(translations.tableHeaderExp)}
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
                href={getCourseUserURL(getCourseId(), submission.courseUserId)}
                underline="hover"
              >
                {submission.courseUserName}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                href={getAssessmentURL(getCourseId(), submission.assessmentId)}
                underline="hover"
              >
                {submission.assessmentTitle}
              </Link>
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
                        href={getCourseUserURL(
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
                    <CustomTooltip
                      title={intl.formatMessage(translations.gradeTooltip)}
                    >
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
    </Table>
  );
};

export default injectIntl(SubmissionsTable);
