import { Component } from 'react';
import { injectIntl } from 'react-intl';
import Warning from '@mui/icons-material/Warning';
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
import PropTypes from 'prop-types';

import { formatLongDateTime } from 'lib/moment';

import { workflowStates } from '../constants';
import { submissionShape } from '../propTypes';
import translations from '../translations';

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
            <TableCell>
              {formatLongDateTime(submission[displayedTime])}
            </TableCell>
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
    const {
      late,
      submitter: { name },
      workflowState,
    } = this.props.submission;
    const title = intl.formatMessage(translations[workflowState]);
    return (
      <Card>
        <CardHeader
          id="submission-by"
          style={styles.header[workflowState]}
          subheader={title}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          title={intl.formatMessage(translations.submissionBy, { name })}
          titleTypographyProps={{ variant: 'subtitle1' }}
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
  intl: PropTypes.object.isRequired,
  submission: submissionShape.isRequired,
};

export default injectIntl(ProgressPanel);
