import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  injectIntl,
  defineMessages,
  intlShape,
  FormattedMessage,
} from 'react-intl';
import { Button } from '@material-ui/core';
import {
  showQuestionForm,
  createSurveyQuestion,
} from 'course/survey/actions/questions';
import { questionTypes } from 'course/survey/constants';
import { formatQuestionFormData } from 'course/survey/utils';

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
  addQuestion: {
    id: 'course.surveys.NewQuestionButton.addQuestion',
    defaultMessage: 'Add Question',
  },
});

class NewQuestionButton extends Component {
  createQuestionHandler = (data) => {
    const { dispatch } = this.props;

    const payload = formatQuestionFormData(data);
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(
      createSurveyQuestion(payload, successMessage, failureMessage),
    );
  };

  showNewQuestionForm = () => {
    const { dispatch, intl, sectionId } = this.props;

    return dispatch(
      showQuestionForm({
        onSubmit: this.createQuestionHandler,
        formTitle: intl.formatMessage(translations.newQuestion),
        initialValues: {
          section_id: sectionId,
          question_type: questionTypes.MULTIPLE_RESPONSE,
          required: false,
          description: '',
          min_options: null,
          max_options: null,
          options: [{}, {}, {}, {}],
        },
      }),
    );
  };

  render() {
    return (
      <Button
        color="primary"
        disabled={this.props.disabled}
        onClick={this.showNewQuestionForm}
      >
        <FormattedMessage {...translations.addQuestion} />
      </Button>
    );
  }
}

NewQuestionButton.propTypes = {
  sectionId: PropTypes.number.isRequired,
  disabled: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

NewQuestionButton.defaultProps = {
  disabled: false,
};

export default connect()(injectIntl(NewQuestionButton));
