import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import history from 'lib/history';
import { formatShortDateTime } from 'lib/moment';
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
    const { surveys, courseId, surveysFlags: { canCreate } } = this.props;
    return (
      <Table bodyStyle={styles.tableBody}>
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow>
            <TableHeaderColumn colSpan={6}>
              <FormattedMessage {...translations.title} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={3} style={styles.wrap}>
              <FormattedMessage {...translations.basePoints} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={3} style={styles.wrap}>
              <FormattedMessage {...translations.bonusPoints} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={5}>
              <FormattedMessage {...translations.opensAt} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={5}>
              <FormattedMessage {...translations.expiresAt} />
            </TableHeaderColumn>
            {
              canCreate ?
                <TableHeaderColumn colSpan={2}>
                  <FormattedMessage {...translations.published} />
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
                  { formatShortDateTime(survey.start_at) }
                </TableRowColumn>
                <TableRowColumn colSpan={5}>
                  { formatShortDateTime(survey.end_at) }
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
                          onTouchTap={() => history.push(
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
                          onTouchTap={() => history.push(
                            `/courses/${courseId}/surveys/${survey.id}/responses`
                          )}
                        /> :
                        null
                    }
                    <RespondButton
                      courseId={courseId}
                      surveyId={survey.id}
                      responseId={survey.response && survey.response.id}
                      canRespond={survey.canRespond}
                      canModify={!!survey.response && survey.response.canModify}
                      canSubmit={!!survey.response && survey.response.canSubmit}
                      startAt={survey.start_at}
                      endAt={survey.end_at}
                      submittedAt={survey.response && survey.response.submitted_at}
                    />
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

export default connect(state => state)(SurveysTable);
