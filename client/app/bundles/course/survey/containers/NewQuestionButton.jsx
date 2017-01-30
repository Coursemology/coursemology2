import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import * as actionCreators from '../actions';
import { questionTypes } from '../constants';
import AddButton from '../components/AddButton';

const translations = defineMessages({
  newQuestion: {
    id: 'course.surveys.NewQuestionButton.title',
    defaultMessage: 'New Question',
  },
  success: {
    id: 'course.surveys.NewQuestionButton.success',
    defaultMessage: 'Question created.',
  },
  failure: {
    id: 'course.surveys.NewQuestionButton.failure',
    defaultMessage: 'Failed to create question.',
  },
});

class NewQuestionButton extends React.Component {
  constructor(props) {
    super(props);

    this.createQuestionHandler = this.createQuestionHandler.bind(this);
    this.showNewQuestionForm = this.showNewQuestionForm.bind(this);
  }

  createQuestionHandler(data) {
    const { dispatch, intl, courseId, surveyId } = this.props;
    const { createSurveyQuestion } = actionCreators;
    const { options, ...questionAttributes } = data;

    // eslint-disable-next-line camelcase
    const options_attributes = options
      .filter(option => option && option.option)
      .map((option, index) => ({ ...option, weight: index + 1 }));

    const payload = { question: { options_attributes, ...questionAttributes } };
    const successMessage = intl.formatMessage(translations.success);
    const failureMessage = intl.formatMessage(translations.failure);
    return dispatch(
      createSurveyQuestion(courseId, surveyId, payload, successMessage, failureMessage)
    );
  }

  showNewQuestionForm() {
    const { dispatch, intl } = this.props;
    const { showQuestionForm } = actionCreators;

    return dispatch(showQuestionForm({
      onSubmit: this.createQuestionHandler,
      formTitle: intl.formatMessage(translations.newQuestion),
      initialValues: {
        question_type: questionTypes.MULTIPLE_RESPONSE,
        required: false,
        description: '',
        min_options: null,
        max_options: null,
        options: [{}, {}, {}, {}],
      },
    }));
  }

  render() {
    return <AddButton onTouchTap={this.showNewQuestionForm} />;
  }
}

NewQuestionButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired,
  surveyId: PropTypes.string.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(state => state)(injectIntl(NewQuestionButton));
