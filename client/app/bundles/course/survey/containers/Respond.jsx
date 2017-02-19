/* eslint-disable camelcase */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import IconButton from 'material-ui/IconButton';
import { Card, CardText } from 'material-ui/Card';
import TitleBar from 'lib/components/TitleBar';
import Subheader from 'material-ui/Subheader';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import { sorts } from '../utils';
import { questionTypes } from '../constants';
import surveyTranslations from '../translations';
import { surveyShape, responseShape } from '../propTypes';
import { fetchResponse, updateResponse } from '../actions/responses';
import ResponseForm from '../components/ResponseForm';

const translations = defineMessages({
  saveSuccess: {
    id: 'course.surveys.Respond.saveSuccess',
    defaultMessage: 'Your response has been saved.',
  },
  saveFailure: {
    id: 'course.surveys.Respond.saveFailure',
    defaultMessage: 'Saving Failed.',
  },
  submitSuccess: {
    id: 'course.surveys.Respond.submitSuccess',
    defaultMessage: 'Your response has been submitted.',
  },
  submitFailure: {
    id: 'course.surveys.Respond.submitFailure',
    defaultMessage: 'Submit Failed.',
  },
  loading: {
    id: 'course.surveys.Respond.loading',
    defaultMessage: 'Loading survey questions...',
  },
});

class Respond extends React.Component {
  static propTypes = {
    survey: surveyShape,
    response: responseShape,
    isLoading: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  static buildInitialValues({ answers }) {
    if (!answers) { return {}; }

    const buildAnswer = (answer) => {
      const { options, ...answerFields } = answer;
      if (answerFields.question_type.toString() === questionTypes.MULTIPLE_CHOICE) {
        const selected_option = options.find(option => option.selected);
        if (selected_option) {
          answerFields.selected_option = selected_option.question_option_id.toString();
        }
      }
      return { ...answerFields, options: options.sort(sorts.byWeight) };
    };

    return { answers: answers.sort(sorts.byWeight).map(buildAnswer) };
  }

  static formatSurveyResponseData(data) {
    const formatAnswer = ({ id, text_response, options, selected_option, question_type }) => {
      const isMultipleChoice =
        question_type.toString() === questionTypes.MULTIPLE_CHOICE && selected_option;
      const reduceOption = ({ id: optionId, selected, question_option_id }) => ({
        id: optionId,
        selected: isMultipleChoice ? (question_option_id.toString() === selected_option) : selected,
      });
      return ({ id, text_response, options_attributes: options.map(reduceOption) });
    };
    return {
      response: {
        answers_attributes: data.answers.map(formatAnswer),
        submit: data.submit,
      },
    };
  }

  static renderDescription(survey) {
    if (!survey.description) { return null; }
    return (
      <Card>
        <CardText>{survey.description}</CardText>
      </Card>
    );
  }

  componentDidMount() {
    const {
      dispatch,
      isLoading,
      params: { courseId, surveyId, responseId },
    } = this.props;

    if (!isLoading) {
      dispatch(fetchResponse(courseId, surveyId, responseId));
    }
  }

  handleUpdateResponse = (data) => {
    const {
      dispatch,
      params: { courseId, surveyId, responseId },
    } = this.props;
    const { saveSuccess, saveFailure, submitSuccess, submitFailure } = translations;
    const payload = Respond.formatSurveyResponseData(data);
    const successMessage = <FormattedMessage {...(data.submit ? submitSuccess : saveSuccess)} />;
    const failureMessage = <FormattedMessage {...(data.submit ? submitFailure : saveFailure)} />;

    return dispatch(
      updateResponse(courseId, surveyId, responseId, payload, successMessage, failureMessage)
    );
  }

  renderForm() {
    const { response, survey, isLoading } = this.props;

    if (isLoading) {
      return <Subheader><FormattedMessage {...translations.loading} /></Subheader>;
    }

    return (
      <div>
        <Subheader><FormattedMessage {...surveyTranslations.questions} /></Subheader>
        <ResponseForm
          initialValues={Respond.buildInitialValues(response)}
          onSubmit={this.handleUpdateResponse}
          {...{ response, survey }}
        />
      </div>
    );
  }

  render() {
    const { survey, params: { courseId } } = this.props;

    return (
      <div>
        <TitleBar
          title={survey.title}
          iconElementLeft={<IconButton><ArrowBack /></IconButton>}
          onLeftIconButtonTouchTap={() => browserHistory.push(`/courses/${courseId}/surveys`)}
        />
        { Respond.renderDescription(survey) }
        { this.renderForm() }
      </div>
    );
  }
}

export default connect(
  state => state.responseForm
)(Respond);
