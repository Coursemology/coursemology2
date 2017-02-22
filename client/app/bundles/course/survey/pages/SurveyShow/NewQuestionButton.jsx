import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { showQuestionForm, createSurveyQuestion } from '../../actions/questions';
import { questionTypes } from '../../constants';
import { formatQuestionFormData } from '../../utils';
import AddButton from '../../components/AddButton';

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
  createQuestionHandler = (data) => {
    const { dispatch, intl, courseId, surveyId } = this.props;

    const payload = formatQuestionFormData(data);
    const successMessage = intl.formatMessage(translations.success);
    const failureMessage = intl.formatMessage(translations.failure);
    return dispatch(
      createSurveyQuestion(courseId, surveyId, payload, successMessage, failureMessage)
    );
  }

  showNewQuestionForm = () => {
    const { dispatch, intl } = this.props;

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
  intl: intlShape.isRequired,
};

export default connect(state => state)(injectIntl(NewQuestionButton));
