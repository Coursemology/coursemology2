import React, { PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { formatDateTime } from 'lib/date_time_defaults';
import surveyTranslations from '../translations';

const translations = defineMessages({
  loading: {
    id: 'course.surveys.SurveyDetails.loading',
    defaultMessage: 'Loading Survey...',
  },
});

const styles = {
  table: {
    maxWidth: 600,
  },
};

const SurveyDetails = ({ intl, survey }) => {
  if (!survey) {
    return <p>{intl.formatMessage(translations.loading)}</p>;
  }

  return (
    <div>
      <h1>{survey.title}</h1>
      <p>{survey.description}</p>
      <Table style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>{intl.formatMessage(surveyTranslations.opensAt)}</TableRowColumn>
            <TableRowColumn>{formatDateTime(survey.start_at)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>{intl.formatMessage(surveyTranslations.expiresAt)}</TableRowColumn>
            <TableRowColumn>{formatDateTime(survey.end_at)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>{intl.formatMessage(surveyTranslations.points)}</TableRowColumn>
            <TableRowColumn>{survey.base_exp}</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

SurveyDetails.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  survey: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    start_at: PropTypes.string,
    end_at: PropTypes.string,
    base_exp: React.PropTypes.number,
  }),
};

export default injectIntl(SurveyDetails);
