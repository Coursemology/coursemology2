import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import ErrorIcon from '@mui/icons-material/Error';
import {
  Chip,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import palette from 'theme/palette';
import { SubmissionMiniEntity } from 'types/course/assessment/submissions';

import CustomTooltip from 'lib/components/core/CustomTooltip';
import Page from 'lib/components/core/layouts/Page';
import TableContainer from 'lib/components/core/layouts/TableContainer';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { getAssessmentURL, getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatMiniDateTime } from 'lib/moment';

import SubmissionsTableButton from '../buttons/SubmissionsTableButton';
import { translateStatus } from '../misc/SubmissionStatus';

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

  if (submissions.length === 0)
    return (
      <Page.PaddedSection>
        <Note message={intl.formatMessage(translations.noSubmissionsMessage)} />
      </Page.PaddedSection>
    );

  return (
    <TableContainer dense variant="bare">
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
    </TableContainer>
  );
};

export default injectIntl(SubmissionsTable);
