import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape, FormattedMessage } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import { showQuestionForm, createSurveyQuestion } from 'course/survey/actions/questions';
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

class NewQuestionButton extends React.Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    disabled: PropTypes.bool,

    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    disabled: false,
  }

  createQuestionHandler = (data) => {
    const { dispatch } = this.props;

    const payload = formatQuestionFormData(data);
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(
      createSurveyQuestion(payload, successMessage, failureMessage)
    );
  }

  showNewQuestionForm = () => {
    const { dispatch, intl, sectionId } = this.props;

    return dispatch(showQuestionForm({
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
    }));
  }

  render() {
    return (
      <FlatButton
        primary
        label={<FormattedMessage {...translations.addQuestion} />}
        onTouchTap={this.showNewQuestionForm}
        disabled={this.props.disabled}
      />
    );
  }
}

export default connect()(injectIntl(NewQuestionButton));
