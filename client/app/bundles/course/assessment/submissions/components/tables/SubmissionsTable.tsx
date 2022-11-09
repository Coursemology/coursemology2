import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';

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
import ErrorIcon from '@mui/icons-material/Error';

import { SubmissionMiniEntity } from 'types/course/assessment/submissions';

import { getCourseId } from 'lib/helpers/url-helpers';
import { getAssessmentURL, getCourseUserURL } from 'lib/helpers/url-builders';
import { getDayMonthTime } from 'lib/helpers/timehelper';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import CustomTooltip from 'lib/components/core/CustomTooltip';
import palette from 'theme/palette';

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
    id: 'course.assessments.submissions.noSubmissionsMessage',
    defaultMessage: 'There are no submissions',
  },
  tableHeaderSn: {
    id: 'course.assessments.submissions.tableHeaderSn',
    defaultMessage: 'S/N',
  },
  tableHeaderName: {
    id: 'course.assessments.submissions.tableHeaderName',
    defaultMessage: 'Name',
  },
  tableHeaderTitle: {
    id: 'course.assessments.submissions.tableHeaderTitle',
    defaultMessage: 'Title',
  },
  tableHeaderSubmittedAt: {
    id: 'course.assessments.submissions.tableHeaderSubmittedAt',
    defaultMessage: 'Submitted At',
  },
  tableHeaderStatus: {
    id: 'course.assessments.submissions.tableHeaderStatus',
    defaultMessage: 'Status',
  },
  tableHeaderTutor: {
    id: 'course.assessments.submissions.tableHeaderTutor',
    defaultMessage: 'Tutor',
  },
  tableHeaderTotalGrade: {
    id: 'course.assessments.submissions.tableHeaderTotalGrade',
    defaultMessage: 'Total Grade',
  },
  tableHeaderExp: {
    id: 'course.assessments.submissions.tableHeaderExp',
    defaultMessage: 'Exp Awarded',
  },
  gradeTooltip: {
    id: 'course.assessments.submissions.gradeTooltip',
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
              {getDayMonthTime(submission.submittedAt)}
            </TableCell>
            <TableCell align="center">
              <Chip
                style={{
                  width: 100,
                  backgroundColor: palette.submissionStatus[submission.status],
                }}
                label={translateStatus(submission.status)}
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
                        fontSize="small"
                        color="error"
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
                canGrade={submission.permissions.canGrade}
                assessmentId={submission.assessmentId}
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
