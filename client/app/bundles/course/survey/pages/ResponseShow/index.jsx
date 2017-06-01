import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { formatLongDateTime } from 'lib/moment';
import { Card, CardText } from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';
import { Table, TableBody, TableRow, TableHeaderColumn, TableRowColumn } from 'material-ui/Table';
import surveyTranslations from 'course/survey/translations';
import { surveyShape, responseShape } from 'course/survey/propTypes';
import { fetchResponse } from 'course/survey/actions/responses';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import ResponseForm, { buildInitialValues } from 'course/survey/containers/ResponseForm';
import RespondButton from 'course/survey/containers/RespondButton';
import UnsubmitButton from 'course/survey/containers/UnsubmitButton';

const translations = defineMessages({
  notSubmitted: {
    id: 'course.surveys.ResponseShow.notSubmitted',
    defaultMessage: 'Not submitted',
  },
});

const styles = {
  submissionInfoTable: {
    marginTop: 10,
    maxWidth: 600,
  },
};

class ResponseShow extends React.Component {
  static propTypes = {
    survey: surveyShape,
    courseId: PropTypes.string.isRequired,
    response: responseShape,
    flags: PropTypes.shape({
      isLoading: PropTypes.bool.isRequired,
      canModify: PropTypes.bool,
      canSubmit: PropTypes.bool,
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        responseId: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { dispatch, match: { params: { responseId } } } = this.props;
    dispatch(fetchResponse(responseId));
  }

  renderSubmissionInfo() {
    const { response } = this.props;
    return (
      <Table style={styles.submissionInfoTable}>
        <TableBody displayRowCheckbox={false}>
          <TableRow selectable={false}>
            <TableHeaderColumn>Student</TableHeaderColumn>
            <TableRowColumn>{response.creator_name}</TableRowColumn>
          </TableRow>
          <TableRow selectable={false}>
            <TableHeaderColumn>Submitted At</TableHeaderColumn>
            <TableRowColumn>
              {response.submitted_at ?
                formatLongDateTime(response.submitted_at) :
                <FormattedMessage {...translations.notSubmitted} />
              }
            </TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderBody() {
    const { survey, response, flags } = this.props;
    if (flags.isLoading) { return <LoadingIndicator />; }
    const initialValues = buildInitialValues(survey, response);

    return (
      <div>
        { this.renderSubmissionInfo() }
        <Subheader><FormattedMessage {...surveyTranslations.questions} /></Subheader>
        <ResponseForm
          readOnly
          {...{ response, flags, initialValues }}
        />
      </div>
    );
  }

  renderRespondButton() {
    const { survey, response, courseId, flags: { canModify, canSubmit, isLoading } } = this.props;
    if (!(canModify || canSubmit) || isLoading) { return null; }

    return (
      <RespondButton
        courseId={courseId}
        surveyId={survey.id}
        responseId={response.id}
        canModify={canModify}
        canSubmit={canSubmit}
        startAt={survey.start_at}
        endAt={survey.end_at}
        submittedAt={response.submitted_at}
      />
    );
  }

  renderUnsubmitButton() {
    const { response, flags: { canUnsubmit, isLoading } } = this.props;
    if (!canUnsubmit || isLoading || !response.submitted_at) { return null; }
    return <UnsubmitButton responseId={response.id} />;
  }

  render() {
    const { survey } = this.props;

    return (
      <div>
        {
          survey.description ?
            <Card><CardText dangerouslySetInnerHTML={{ __html: survey.description }} /></Card> :
          null
        }
        { this.renderBody() }
        { this.renderRespondButton() }
        { this.renderUnsubmitButton() }
      </div>
    );
  }
}

export const UnconnectedResponseShow = ResponseShow;
export default connect(state => state.responseForm)(ResponseShow);
