import React, { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { red100, yellow100, grey100, green100, blue100 } from 'material-ui/styles/colors';
import WarningIcon from 'material-ui/svg-icons/alert/warning';

import { formatDateTime } from '../utils';
import { SubmissionProp } from '../propTypes';
import translations from '../translations';

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
      <Card style={{ backgroundColor: red100 }}>
        <CardText>
          <WarningIcon style={styles.warningIcon} />
          <span>{intl.formatMessage(translations.lateSubmission)}</span>
        </CardText>
      </Card>
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
        <CardText>{late ? this.renderLateWarning() : null}</CardText>
        <CardText>{this.renderTimes()}</CardText>
      </Card>
    );
  }
}

ProgressPanel.propTypes = {
  intl: intlShape.isRequired,
  submission: SubmissionProp.isRequired,
};

export default injectIntl(ProgressPanel);
