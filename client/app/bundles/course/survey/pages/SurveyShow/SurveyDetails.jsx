import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import Toggle from 'material-ui/Toggle';
import PropTypes from 'prop-types';

import { updateSurvey } from 'course/survey/actions/surveys';
import RespondButton from 'course/survey/containers/RespondButton';
import { surveyShape } from 'course/survey/propTypes';
import surveyTranslations from 'course/survey/translations';
import history from 'lib/history';
import { formatLongDateTime } from 'lib/moment';
import libTranslations from 'lib/translations';

import DownloadResponsesButton from './DownloadResponsesButton';
import NewSectionButton from './NewSectionButton';

const styles = {
  table: {
    maxWidth: 600,
  },
  button: {
    marginRight: 15,
  },
};

class SurveyDetails extends Component {
  handlePublishToggle = (event, value) => {
    const { dispatch, survey } = this.props;
    dispatch(
      updateSurvey(
        survey.id,
        { survey: { published: value } },
        <FormattedMessage
          {...surveyTranslations.updateSuccess}
          values={survey}
        />,
        <FormattedMessage
          {...surveyTranslations.updateFailure}
          values={survey}
        />,
      ),
    );
  };

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
        <p
          dangerouslySetInnerHTML={{ __html: survey.description }}
          style={{ whiteSpace: 'pre-line' }}
        />
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
          onToggle={this.handlePublishToggle}
          toggled={survey.published}
        />
      </CardText>
    );
  }

  render() {
    const { survey, courseId, disabled } = this.props;
    if (!survey) {
      return null;
    }
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
                  {formatLongDateTime(survey.start_at)}
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.expiresAt} />
                </TableRowColumn>
                <TableRowColumn>
                  {formatLongDateTime(survey.end_at)}
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.basePoints} />
                </TableRowColumn>
                <TableRowColumn>{survey.base_exp}</TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.bonusPoints} />
                </TableRowColumn>
                <TableRowColumn>
                  {survey.allow_response_after_end
                    ? survey.time_bonus_exp
                    : '-'}
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.anonymous} />
                </TableRowColumn>
                <TableRowColumn>
                  <FormattedMessage
                    {...libTranslations[survey.anonymous ? 'yes' : 'no']}
                  />
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage
                    {...surveyTranslations.allowResponseAfterEnd}
                  />
                </TableRowColumn>
                <TableRowColumn>
                  <FormattedMessage
                    {...libTranslations[
                      survey.allow_response_after_end ? 'yes' : 'no'
                    ]}
                  />
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage
                    {...surveyTranslations.allowModifyAfterSubmit}
                  />
                </TableRowColumn>
                <TableRowColumn>
                  <FormattedMessage
                    {...libTranslations[
                      survey.allow_modify_after_submit ? 'yes' : 'no'
                    ]}
                  />
                </TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {this.renderPublishToggle()}
        {this.renderDescription()}
        <CardText>
          {survey.canCreateSection ? (
            <NewSectionButton {...{ disabled }} />
          ) : null}
          {survey.canViewResults ? (
            <RaisedButton
              label={<FormattedMessage {...surveyTranslations.results} />}
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
              label={<FormattedMessage {...surveyTranslations.responses} />}
              onClick={() =>
                history.push(
                  `/courses/${courseId}/surveys/${survey.id}/responses`,
                )
              }
              style={styles.button}
            />
          ) : null}
          <DownloadResponsesButton />
          <RespondButton
            canModify={!!survey.response && survey.response.canModify}
            canRespond={survey.canRespond}
            canSubmit={!!survey.response && survey.response.canSubmit}
            courseId={courseId}
            endAt={survey.end_at}
            responseId={survey.response && survey.response.id}
            startAt={survey.start_at}
            submittedAt={survey.response && survey.response.submitted_at}
            surveyId={survey.id}
          />
        </CardText>
      </Card>
    );
  }
}

SurveyDetails.propTypes = {
  survey: surveyShape,
  courseId: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
};

export default connect()(SurveyDetails);
