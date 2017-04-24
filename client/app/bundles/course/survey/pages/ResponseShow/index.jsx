import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import moment from 'moment';
import IconButton from 'material-ui/IconButton';
import { Card, CardText } from 'material-ui/Card';
import TitleBar from 'lib/components/TitleBar';
import Subheader from 'material-ui/Subheader';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import { Table, TableBody, TableRow, TableHeaderColumn, TableRowColumn } from 'material-ui/Table';
import surveyTranslations from 'course/survey/translations';
import { surveyShape, responseShape } from 'course/survey/propTypes';
import { fetchResponse } from 'course/survey/actions/responses';
import LoadingIndicator from 'course/survey/components/LoadingIndicator';
import ResponseForm from 'course/survey/containers/ResponseForm';
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
    surveys: PropTypes.arrayOf(surveyShape),
    response: responseShape,
    flags: PropTypes.shape({
      isLoading: PropTypes.bool.isRequired,
      canModify: PropTypes.bool,
      canSubmit: PropTypes.bool,
    }),
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      surveyId: PropTypes.string.isRequired,
      responseId: PropTypes.string.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { dispatch, params: { responseId } } = this.props;
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
                moment(response.submitted_at).format('DD MMM YYYY, h:mma') :
                <FormattedMessage {...translations.notSubmitted} />
              }
            </TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderBody() {
    const { response, flags } = this.props;
    if (flags.isLoading) { return <LoadingIndicator />; }

    return (
      <div>
        { this.renderSubmissionInfo() }
        <Subheader><FormattedMessage {...surveyTranslations.questions} /></Subheader>
        <ResponseForm
          readOnly
          initialValues={response}
          {...{ response, flags }}
        />
      </div>
    );
  }

  renderRespondButton(survey) {
    const { response, params: { courseId }, flags: { canModify, canSubmit, isLoading } } = this.props;
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
    if (!canUnsubmit || isLoading) { return null; }
    return <UnsubmitButton responseId={response.id} />;
  }

  render() {
    const { surveys, params: { courseId, surveyId } } = this.props;
    const survey = surveys && surveys.length > 0 ?
                   surveys.find(s => String(s.id) === String(surveyId)) : {};

    return (
      <div>
        <TitleBar
          title={survey.title}
          iconElementLeft={<IconButton><ArrowBack /></IconButton>}
          onLeftIconButtonTouchTap={
            () => browserHistory.push(`/courses/${courseId}/surveys/${surveyId}`)
          }
        />
        { survey.description ? <Card><CardText>{survey.description}</CardText></Card> : null }
        { this.renderBody() }
        { this.renderRespondButton(survey) }
        { this.renderUnsubmitButton() }
      </div>
    );
  }
}

export const UnconnectedResponseShow = ResponseShow;

export default connect(
  state => ({
    ...state.responseForm,
    surveys: state.surveys,
  })
)(ResponseShow);
