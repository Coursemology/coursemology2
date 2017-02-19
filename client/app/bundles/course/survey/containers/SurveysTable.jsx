import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import { standardDateFormat } from 'lib/date_time_defaults';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Toggle from 'material-ui/Toggle';
import translations from '../translations';
import { surveyShape } from '../propTypes';
import { updateSurvey } from '../actions/surveys';
import RespondButton from '../containers/RespondButton';

const styles = {
  tableBody: {
    // Prevent new survey button from obstructing table.
    marginBottom: 100,
  },
};

class SurveysTable extends React.Component {
  static propTypes = {
    courseId: PropTypes.string.isRequired,

    surveys: PropTypes.arrayOf(surveyShape),
    canCreate: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  renderPublishToggle(survey) {
    const { dispatch, courseId } = this.props;
    if (!survey.canUpdate) {
      return null;
    }

    return (
      <Toggle
        labelPosition="right"
        toggled={survey.published}
        onToggle={(event, value) =>
          dispatch(updateSurvey(
            courseId,
            survey.id,
            { survey: { published: value } },
            <FormattedMessage {...translations.updateSuccess} values={survey} />,
            <FormattedMessage {...translations.updateFailure} values={survey} />
          ))
        }
      />
    );
  }

  render() {
    const { intl, surveys, courseId, canCreate } = this.props;
    return (
      <Table bodyStyle={styles.tableBody}>
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow>
            <TableHeaderColumn colSpan={2}>
              {intl.formatMessage(translations.title)}
            </TableHeaderColumn>
            <TableHeaderColumn>{intl.formatMessage(translations.points)}</TableHeaderColumn>
            <TableHeaderColumn>{intl.formatMessage(translations.opensAt)}</TableHeaderColumn>
            <TableHeaderColumn>{intl.formatMessage(translations.expiresAt)}</TableHeaderColumn>
            {
              canCreate ?
                <TableHeaderColumn>
                  {intl.formatMessage(translations.published)}
                </TableHeaderColumn> :
                null
            }
            <TableHeaderColumn />
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          showRowHover
        >
          {
            surveys.map(survey => (
              <TableRow key={survey.id}>
                <TableRowColumn colSpan={2}>
                  <Link to={`/courses/${courseId}/surveys/${survey.id}`}>
                    { survey.title }
                  </Link>
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
                {
                  canCreate ?
                    <TableHeaderColumn>
                      { this.renderPublishToggle(survey) }
                    </TableHeaderColumn> :
                    null
                }
                <TableHeaderColumn>
                  <RespondButton {...{ survey, courseId }} />
                </TableHeaderColumn>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    );
  }
}

export default connect(state => state)(injectIntl(SurveysTable));
