import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import {
  Card,
  CardContent,
  CardHeader,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { blue, green, grey, red, yellow } from '@mui/material/colors';
import Warning from '@mui/icons-material/Warning';

import { formatDateTime } from '../utils';
import { submissionShape } from '../propTypes';
import translations from '../translations';
import { workflowStates } from '../constants';

const styles = {
  header: {
    attempting: {
      backgroundColor: yellow[100],
    },
    submitted: {
      backgroundColor: grey[100],
    },
    graded: {
      backgroundColor: blue[100],
    },
    published: {
      backgroundColor: green[100],
    },
  },
  warningIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  table: {
    maxWidth: 600,
  },
};

class ProgressPanel extends Component {
  renderLateWarning() {
    const { intl } = this.props;
    return (
      <CardContent>
        <Paper style={{ backgroundColor: red[100], padding: 10 }}>
          <Warning style={styles.warningIcon} />
          <span id="late-submission">
            {intl.formatMessage(translations.lateSubmission)}
          </span>
        </Paper>
      </CardContent>
    );
  }

  renderSummary() {
    const { intl, submission } = this.props;
    const { workflowState } = submission;

    const displayedTime = {
      [workflowStates.Attempting]: 'attemptedAt',
      [workflowStates.Submitted]: 'submittedAt',
      [workflowStates.Graded]: 'gradedAt',
      [workflowStates.Published]: 'gradedAt',
    }[workflowState];

    return (
      <Table style={styles.table}>
        <TableBody>
          <TableRow>
            <TableCell>
              {intl.formatMessage(translations[displayedTime])}
            </TableCell>
            <TableCell>{formatDateTime(submission[displayedTime])}</TableCell>
          </TableRow>
          {workflowState === workflowStates.Graded ||
          workflowState === workflowStates.Published ? (
            <TableRow>
              <TableCell>
                {intl.formatMessage(translations.totalGrade)}
              </TableCell>
              <TableCell>{`${submission.grade} / ${submission.maximumGrade}`}</TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    );
  }

  render() {
    const { intl } = this.props;
    const { late, submitter, workflowState } = this.props.submission;
    const title = intl.formatMessage(translations[workflowState]);
    return (
      <Card>
        <CardHeader
          id="submission-by"
          title={intl.formatMessage(translations.submissionBy, { submitter })}
          titleTypographyProps={{ variant: 'subtitle1' }}
          subheader={title}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          style={styles.header[workflowState]}
        />
        {late && workflowState === workflowStates.Submitted
          ? this.renderLateWarning()
          : null}
        {this.renderSummary()}
      </Card>
    );
  }
}

ProgressPanel.propTypes = {
  intl: intlShape.isRequired,
  submission: submissionShape.isRequired,
};

export default injectIntl(ProgressPanel);
