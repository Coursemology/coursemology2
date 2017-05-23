import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { formatLongDateTime } from 'lib/moment';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardText } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import libTranslations from 'lib/translations';
import history from 'lib/history';
import surveyTranslations from 'course/survey/translations';
import { surveyShape } from 'course/survey/propTypes';
import { updateSurvey } from 'course/survey/actions/surveys';
import RespondButton from 'course/survey/containers/RespondButton';
import NewSectionButton from './NewSectionButton';

const styles = {
  table: {
    maxWidth: 600,
  },
  button: {
    marginRight: 15,
  },
};

class SurveyDetails extends React.Component {
  static propTypes = {
    survey: surveyShape,
    courseId: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,

    dispatch: PropTypes.func.isRequired,
  };

  handlePublishToggle = (event, value) => {
    const { dispatch, survey } = this.props;
    dispatch(updateSurvey(
      survey.id,
      { survey: { published: value } },
      <FormattedMessage {...surveyTranslations.updateSuccess} values={survey} />,
      <FormattedMessage {...surveyTranslations.updateFailure} values={survey} />
    ));
  }

  renderDescription() {
    const { survey } = this.props;

    if (!survey.description) {
      return null;
    }

    return (
      <CardText>
        <h4>
          <FormattedMessage {...surveyTranslations.description} />
        </h4>
        <p dangerouslySetInnerHTML={{ __html: survey.description }} />
      </CardText>
    );
  }

  renderPublishToggle() {
    const { survey } = this.props;
    if (!survey.canUpdate) {
      return null;
    }

    return (
      <CardText>
        <Toggle
          label={<FormattedMessage {...surveyTranslations.published} />}
          labelPosition="right"
          toggled={survey.published}
          onToggle={this.handlePublishToggle}
        />
      </CardText>
    );
  }

  render() {
    const { survey, courseId, disabled } = this.props;
    if (!survey) { return null; }
    return (
      <Card>
        <div>
          <Table style={styles.table}>
            <TableBody displayRowCheckbox={false}>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.opensAt} />
                </TableRowColumn>
                <TableRowColumn>
                  { formatLongDateTime(survey.start_at) }
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.expiresAt} />
                </TableRowColumn>
                <TableRowColumn>
                  { formatLongDateTime(survey.end_at) }
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.basePoints} />
                </TableRowColumn>
                <TableRowColumn>
                  {survey.base_exp}
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.bonusPoints} />
                </TableRowColumn>
                <TableRowColumn>
                  {survey.allow_response_after_end ? survey.time_bonus_exp : '-'}
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.anonymous} />
                </TableRowColumn>
                <TableRowColumn>
                  <FormattedMessage {...libTranslations[survey.anonymous ? 'yes' : 'no']} />
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.allowResponseAfterEnd} />
                </TableRowColumn>
                <TableRowColumn>
                  <FormattedMessage
                    {...libTranslations[survey.allow_response_after_end ? 'yes' : 'no']}
                  />
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.allowModifyAfterSubmit} />
                </TableRowColumn>
                <TableRowColumn>
                  <FormattedMessage
                    {...libTranslations[survey.allow_modify_after_submit ? 'yes' : 'no']}
                  />
                </TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {this.renderPublishToggle()}
        {this.renderDescription()}
        <CardText>
          { survey.canCreateSection ? <NewSectionButton {...{ disabled }} /> : null }
          {
            survey.canViewResults ?
              <RaisedButton
                style={styles.button}
                label={<FormattedMessage {...surveyTranslations.results} />}
                onTouchTap={() => history.push(
                `/courses/${courseId}/surveys/${survey.id}/results`
              )}
              /> : null
          }
          {
            survey.canViewResults ?
              <RaisedButton
                style={styles.button}
                label={<FormattedMessage {...surveyTranslations.responses} />}
                onTouchTap={() => history.push(
                `/courses/${courseId}/surveys/${survey.id}/responses`
              )}
              /> : null
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
        </CardText>
      </Card>
    );
  }
}

export default connect()(SurveyDetails);
