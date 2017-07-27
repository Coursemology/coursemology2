import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { red100, yellow100, grey100, green100, blue100 } from 'material-ui/styles/colors';
import WarningIcon from 'material-ui/svg-icons/alert/warning';

import { formatDateTime } from '../utils';
import { submissionShape } from '../propTypes';
import translations from '../translations';
import { workflowStates } from '../constants';

const styles = {
  header: {
    attempting: {
      backgroundColor: yellow100,
    },
    submitted: {
      backgroundColor: grey100,
    },
    graded: {
      backgroundColor: blue100,
    },
    published: {
      backgroundColor: green100,
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
      <Paper style={{ backgroundColor: red100, padding: 10 }}>
        <WarningIcon style={styles.warningIcon} />
        <span>{intl.formatMessage(translations.lateSubmission)}</span>
      </Paper>
    );
  }

  renderTimes() {
    const { intl } = this.props;
    const { submittedAt } = this.props.submission;
    return (
      <Table selectable={false} style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>{intl.formatMessage(translations.submittedAt)}</TableRowColumn>
            <TableRowColumn>{formatDateTime(submittedAt)}</TableRowColumn>
          </TableRow>
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
          title={intl.formatMessage(translations.submissionBy, { submitter })}
          subtitle={title}
          style={styles.header[workflowState]}
        />
        <CardText>
          {late && workflowState !== workflowStates.Submitted ? this.renderLateWarning() : null}
        </CardText>
        <CardText>{this.renderTimes()}</CardText>
      </Card>
    );
  }
}

ProgressPanel.propTypes = {
  intl: intlShape.isRequired,
  submission: submissionShape.isRequired,
};

export default injectIntl(ProgressPanel);
