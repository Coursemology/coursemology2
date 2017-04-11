import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Link, browserHistory } from 'react-router';
import { standardDateFormat } from 'lib/date-time-defaults';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import translations from 'course/survey/translations';
import { surveyShape } from 'course/survey/propTypes';
import { updateSurvey } from 'course/survey/actions/surveys';
import RespondButton from 'course/survey/containers/RespondButton';

const styles = {
  tableBody: {
    // Prevent new survey button from obstructing table.
    marginBottom: 100,
  },
  buttonsColumn: {
    display: 'flex',
  },
  button: {
    marginRight: 15,
  },
  wrap: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
};

class SurveysTable extends React.Component {
  static propTypes = {
    courseId: PropTypes.string.isRequired,

    surveys: PropTypes.arrayOf(surveyShape),
    surveysFlags: PropTypes.shape({
      canCreate: PropTypes.bool.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  renderPublishToggle(survey) {
    const { dispatch } = this.props;
    if (!survey.canUpdate) {
      return null;
    }

    return (
      <Toggle
        labelPosition="right"
        toggled={survey.published}
        onToggle={(event, value) =>
          dispatch(updateSurvey(
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
    const { intl, surveys, courseId, surveysFlags: { canCreate } } = this.props;
    return (
      <Table bodyStyle={styles.tableBody}>
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow>
            <TableHeaderColumn colSpan={6}>
              {intl.formatMessage(translations.title)}
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={3} style={styles.wrap}>
              {intl.formatMessage(translations.basePoints)}
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={3} style={styles.wrap}>
              {intl.formatMessage(translations.bonusPoints)}
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={5}>
              {intl.formatMessage(translations.opensAt)}
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={5}>
              {intl.formatMessage(translations.expiresAt)}
            </TableHeaderColumn>
            {
              canCreate ?
                <TableHeaderColumn colSpan={2}>
                  {intl.formatMessage(translations.published)}
                </TableHeaderColumn> :
                null
            }
            <TableHeaderColumn colSpan={canCreate ? 14 : 4} />
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          showRowHover
        >
          {
            surveys.map(survey => (
              <TableRow key={survey.id}>
                <TableRowColumn colSpan={6}>
                  <Link to={`/courses/${courseId}/surveys/${survey.id}`}>
                    { survey.title }
                  </Link>
                </TableRowColumn>
                <TableRowColumn colSpan={3}>
                  { survey.base_exp }
                </TableRowColumn>
                <TableRowColumn colSpan={3}>
                  { survey.allow_response_after_end ? survey.time_bonus_exp : '-' }
                </TableRowColumn>
                <TableRowColumn colSpan={5}>
                  { intl.formatDate(survey.start_at, standardDateFormat) }
                </TableRowColumn>
                <TableRowColumn colSpan={5}>
                  { survey.end_at ? intl.formatDate(survey.end_at, standardDateFormat) : [] }
                </TableRowColumn>
                {
                  canCreate ?
                    <TableHeaderColumn colSpan={2}>
                      { this.renderPublishToggle(survey) }
                    </TableHeaderColumn> :
                    null
                }
                <TableHeaderColumn colSpan={canCreate ? 14 : 4}>
                  <div style={styles.buttonsColumn}>
                    {
                      survey.canViewResults ?
                        <RaisedButton
                          style={styles.button}
                          label={<FormattedMessage {...translations.results} />}
                          onTouchTap={() => browserHistory.push(
                            `/courses/${courseId}/surveys/${survey.id}/results`
                          )}
                        /> :
                        null
                    }
                    {
                      survey.canViewResults ?
                        <RaisedButton
                          style={styles.button}
                          label={<FormattedMessage {...translations.responses} />}
                          onTouchTap={() => browserHistory.push(
                            `/courses/${courseId}/surveys/${survey.id}/responses`
                          )}
                        /> :
                        null
                    }
                    <RespondButton {...{ survey, courseId }} />
                  </div>
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
