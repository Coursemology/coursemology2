import React, { PropTypes } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { standardDateFormat } from 'lib/date_time_defaults';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

const translations = defineMessages({
  title: {
    id: 'course.surveys.SurveysTable.tableHeaders.title',
    defaultMessage: 'Title',
  },
  points: {
    id: 'course.surveys.SurveysTable.tableHeaders.points',
    defaultMessage: 'Points',
  },
  opensAt: {
    id: 'course.surveys.SurveysTable.tableHeaders.openAt',
    defaultMessage: 'Opens At',
  },
  expiresAt: {
    id: 'course.surveys.SurveysTable.tableHeaders.expiresAt',
    defaultMessage: 'Expires At',
  },
});

const styles = {
  tableBody: {
    // Prevent new survey button from obstructing table.
    marginBottom: 100,
  },
};

const propTypes = {
  surveys: PropTypes.array.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const SurveysTable = ({ surveys, intl }) => (
  <Table bodyStyle={styles.tableBody}>
    <TableHeader
      displaySelectAll={false}
      adjustForCheckbox={false}
    >
      <TableRow>
        <TableHeaderColumn>{intl.formatMessage(translations.title)}</TableHeaderColumn>
        <TableHeaderColumn>{intl.formatMessage(translations.points)}</TableHeaderColumn>
        <TableHeaderColumn>{intl.formatMessage(translations.opensAt)}</TableHeaderColumn>
        <TableHeaderColumn>{intl.formatMessage(translations.expiresAt)}</TableHeaderColumn>
      </TableRow>
    </TableHeader>
    <TableBody
      displayRowCheckbox={false}
      showRowHover
    >
      {
        surveys.map(survey => (
          <TableRow key={survey.id}>
            <TableRowColumn>
              { survey.title }
            </TableRowColumn>
            <TableRowColumn>
              { survey.base_exp }
            </TableRowColumn>
            <TableRowColumn>
              { intl.formatDate(survey.start_at, standardDateFormat) }
            </TableRowColumn>
            <TableRowColumn>
              { survey.end_at ? intl.formatDate(survey.end_at, standardDateFormat) : [] }
            </TableRowColumn>
          </TableRow>
        ))
      }
    </TableBody>
  </Table>
);

SurveysTable.propTypes = propTypes;

export default injectIntl(SurveysTable);
