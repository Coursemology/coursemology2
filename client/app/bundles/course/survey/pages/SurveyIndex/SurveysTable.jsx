import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import Toggle from 'material-ui/Toggle';
import PropTypes from 'prop-types';

import { updateSurvey } from 'course/survey/actions/surveys';
import RespondButton from 'course/survey/containers/RespondButton';
import { surveyShape } from 'course/survey/propTypes';
import translations from 'course/survey/translations';
import history from 'lib/history';
import { formatShortDateTime } from 'lib/moment';

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

class SurveysTable extends Component {
  renderPublishToggle(survey) {
    const { dispatch } = this.props;
    if (!survey.canUpdate) {
      return null;
    }

    return (
      <Toggle
        labelPosition="right"
        onToggle={(event, value) =>
          dispatch(
            updateSurvey(
              survey.id,
              { survey: { published: value } },
              <FormattedMessage
                {...translations.updateSuccess}
                values={survey}
              />,
              <FormattedMessage
                {...translations.updateFailure}
                values={survey}
              />,
            ),
          )
        }
        toggled={survey.published}
      />
    );
  }

  render() {
    const {
      surveys,
      courseId,
      surveysFlags: { canCreate },
    } = this.props;
    return (
      <Table bodyStyle={styles.tableBody}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
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
            {canCreate ? (
              <TableHeaderColumn colSpan={2}>
                <FormattedMessage {...translations.published} />
              </TableHeaderColumn>
            ) : null}
            <TableHeaderColumn colSpan={canCreate ? 14 : 4} />
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} showRowHover={true}>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableRowColumn colSpan={6} style={styles.wrap}>
                <Link to={`/courses/${courseId}/surveys/${survey.id}`}>
                  {survey.title}
                </Link>
              </TableRowColumn>
              <TableRowColumn colSpan={3}>{survey.base_exp}</TableRowColumn>
              <TableRowColumn colSpan={3}>
                {survey.allow_response_after_end ? survey.time_bonus_exp : '-'}
              </TableRowColumn>
              <TableRowColumn colSpan={5} style={styles.wrap}>
                {formatShortDateTime(survey.start_at)}
              </TableRowColumn>
              <TableRowColumn colSpan={5} style={styles.wrap}>
                {formatShortDateTime(survey.end_at)}
              </TableRowColumn>
              {canCreate ? (
                <TableHeaderColumn colSpan={2}>
                  {this.renderPublishToggle(survey)}
                </TableHeaderColumn>
              ) : null}
              <TableHeaderColumn colSpan={canCreate ? 14 : 4}>
                <div style={styles.buttonsColumn}>
                  {survey.canViewResults ? (
                    <RaisedButton
                      label={<FormattedMessage {...translations.results} />}
                      onClick={() =>
                        history.push(
                          `/courses/${courseId}/surveys/${survey.id}/results`,
                        )
                      }
                      style={styles.button}
                    />
                  ) : null}
                  {survey.canViewResults ? (
                    <RaisedButton
                      label={<FormattedMessage {...translations.responses} />}
                      onClick={() =>
                        history.push(
                          `/courses/${courseId}/surveys/${survey.id}/responses`,
                        )
                      }
                      style={styles.button}
                    />
                  ) : null}
                  <RespondButton
                    canModify={!!survey.response && survey.response.canModify}
                    canRespond={survey.canRespond}
                    canSubmit={!!survey.response && survey.response.canSubmit}
                    courseId={courseId}
                    endAt={survey.end_at}
                    responseId={survey.response && survey.response.id}
                    startAt={survey.start_at}
                    submittedAt={
                      survey.response && survey.response.submitted_at
                    }
                    surveyId={survey.id}
                  />
                </div>
              </TableHeaderColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

SurveysTable.propTypes = {
  courseId: PropTypes.string.isRequired,

  surveys: PropTypes.arrayOf(surveyShape),
  surveysFlags: PropTypes.shape({
    canCreate: PropTypes.bool.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => state)(SurveysTable);
