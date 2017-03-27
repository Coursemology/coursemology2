import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape, FormattedMessage } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import { showQuestionForm, createSurveyQuestion } from '../../../actions/questions';
import { questionTypes } from '../../../constants';
import { formatQuestionFormData } from '../../../utils';

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

    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

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
      />
    );
  }
}

export default connect()(injectIntl(NewQuestionButton));
