import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {
  Card,
  CardContent,
  ListSubheader,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import { fetchResponse } from 'course/survey/actions/responses';
import RespondButton from 'course/survey/containers/RespondButton';
import ResponseForm, {
  buildInitialValues,
} from 'course/survey/containers/ResponseForm';
import UnsubmitButton from 'course/survey/containers/UnsubmitButton';
import { responseShape, surveyShape } from 'course/survey/propTypes';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import withRouter from 'lib/components/navigation/withRouter';
import { formatLongDateTime } from 'lib/moment';

import withSurveyLayout from '../../containers/SurveyLayout';

const translations = defineMessages({
  notSubmitted: {
    id: 'course.survey.ResponseShow.notSubmitted',
    defaultMessage: 'Not submitted',
  },
});

const styles = {
  submissionInfoTable: {
    marginTop: 10,
    maxWidth: 600,
  },
};

export class ResponseShow extends Component {
  componentDidMount() {
    const {
      dispatch,
      match: {
        params: { responseId },
      },
    } = this.props;
    dispatch(fetchResponse(responseId));
  }

  renderBody() {
    const { survey, response, flags } = this.props;
    if (flags.isLoading) {
      return <LoadingIndicator />;
    }
    const initialValues = buildInitialValues(survey, response);

    return (
      <>
        {this.renderSubmissionInfo()}
        <ListSubheader disableSticky>
          <FormattedMessage {...surveyTranslations.questions} />
        </ListSubheader>
        <ResponseForm readOnly {...{ response, flags, initialValues }} />
      </>
    );
  }

  renderRespondButton() {
    const {
      survey,
      response,
      courseId,
      flags: { canModify, canSubmit, isLoading },
    } = this.props;
    if (!(canModify || canSubmit) || isLoading) {
      return null;
    }

    return (
      <RespondButton
        canModify={canModify}
        canSubmit={canSubmit}
        courseId={courseId}
        endAt={survey.end_at}
        responseId={response.id}
        startAt={survey.start_at}
        submittedAt={response.submitted_at}
        surveyId={survey.id}
      />
    );
  }

  renderSubmissionInfo() {
    const { response } = this.props;
    return (
      <Table style={styles.submissionInfoTable}>
        <TableBody>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>{response.creator_name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Submitted At</TableCell>
            <TableCell>
              {response.submitted_at ? (
                formatLongDateTime(response.submitted_at)
              ) : (
                <FormattedMessage {...translations.notSubmitted} />
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated At</TableCell>
            <TableCell>
              {response.submitted_at ? (
                formatLongDateTime(response.updated_at)
              ) : (
                <FormattedMessage {...translations.notSubmitted} />
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderUnsubmitButton() {
    const {
      response,
      flags: { canUnsubmit, isLoading },
    } = this.props;
    if (!canUnsubmit || isLoading || !response.submitted_at) {
      return null;
    }
    return (
      <span style={{ marginLeft: 12 }}>
        <UnsubmitButton isIcon={false} responseId={response.id} />
      </span>
    );
  }

  render() {
    const { survey } = this.props;

    return (
      <>
        {survey.description ? (
          <Card>
            <CardContent>
              <Typography
                dangerouslySetInnerHTML={{ __html: survey.description }}
                variant="body2"
              />
            </CardContent>
          </Card>
        ) : null}
        {this.renderBody()}
        {this.renderRespondButton()}
        {this.renderUnsubmitButton()}
      </>
    );
  }
}

ResponseShow.propTypes = {
  survey: surveyShape,
  courseId: PropTypes.string.isRequired,
  response: responseShape,
  flags: PropTypes.shape({
    canUnsubmit: PropTypes.bool,
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

export default withSurveyLayout(
  withRouter(connect(({ surveys }) => surveys.responseForm)(ResponseShow)),
);
