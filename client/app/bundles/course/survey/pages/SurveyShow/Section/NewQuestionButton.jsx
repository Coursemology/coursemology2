import { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import {
  createSurveyQuestion,
  showQuestionForm,
} from 'course/survey/actions/questions';
import { questionTypes } from 'course/survey/constants';
import { formatQuestionFormData } from 'course/survey/utils';

const translations = defineMessages({
  newQuestion: {
    id: 'course.survey.NewQuestionButton.newQuestion',
    defaultMessage: 'New Question',
  },
  success: {
    id: 'course.survey.NewQuestionButton.success',
    defaultMessage: 'Question created.',
  },
  failure: {
    id: 'course.survey.NewQuestionButton.failure',
    defaultMessage: 'Failed to create question.',
  },
  addQuestion: {
    id: 'course.survey.NewQuestionButton.addQuestion',
    defaultMessage: 'Add Question',
  },
});

class NewQuestionButton extends Component {
  createQuestionHandler = (data, setError) => {
    const { dispatch } = this.props;

    const payload = formatQuestionFormData(data);
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(
      createSurveyQuestion(payload, successMessage, failureMessage, setError),
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
          description: '',
          required: false,
          grid_view: false,
          min_options: undefined,
          max_options: undefined,
          options: [
            {
              weight: null,
              option: '',
              image_url: '',
              image_name: '',
              file: null,
            },
            {
              weight: null,
              option: '',
              image_url: '',
              image_name: '',
              file: null,
            },
            {
              weight: null,
              option: '',
              image_url: '',
              image_name: '',
              file: null,
            },
            {
              weight: null,
              option: '',
              image_url: '',
              image_name: '',
              file: null,
            },
          ],
          // optionsToDelete is not used for new question but only edit question.
          // However, it is added here to avoid uncontrolled field warning.
          optionsToDelete: [],
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
        variant="contained"
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
  intl: PropTypes.object.isRequired,
};

NewQuestionButton.defaultProps = {
  disabled: false,
};

export default connect()(injectIntl(NewQuestionButton));
