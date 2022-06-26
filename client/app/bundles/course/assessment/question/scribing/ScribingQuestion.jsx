import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import NotificationPopup from 'lib/containers/NotificationPopup';
import { getScribingId } from 'lib/helpers/url-helpers';
import ScribingQuestionForm from './containers/ScribingQuestionForm';
import * as scribingQuestionActionCreators from './actions/scribingQuestionActionCreators';
import { questionShape } from './propTypes';
import translations from './containers/ScribingQuestionForm/ScribingQuestionForm.intl';

function buildInitialValues(scribingQuestion) {
  return scribingQuestion.question
    ? {
        title: scribingQuestion.question.title || '',
        description: scribingQuestion.question.description || '',
        staff_only_comments:
          scribingQuestion.question.staff_only_comments || '',
        maximum_grade: scribingQuestion.question.maximum_grade || '',
        skill_ids: scribingQuestion.question.skill_ids,
        attachment: scribingQuestion.question.attachment || {},
      }
    : {
        title: '',
        description: '',
        staff_only_comments: '',
        maximum_grade: '',
        skill_ids: [],
        attachment: {},
      };
}

function mapStateToProps({ scribingQuestion, ...state }) {
  return {
    ...state,
    scribingQuestion,
    initialValues: buildInitialValues(scribingQuestion),
    scribingId: getScribingId(),
  };
}

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  scribingQuestion: PropTypes.shape({
    question: questionShape,
    isLoading: PropTypes.bool,
  }).isRequired,
  intl: PropTypes.object,
  scribingId: PropTypes.string,
};

const ScribingQuestion = (props) => {
  const { dispatch, intl, scribingId, scribingQuestion } = props;
  const actions = bindActionCreators(scribingQuestionActionCreators, dispatch);
  const initialValues = buildInitialValues(scribingQuestion);

  useEffect(() => {
    if (scribingId) {
      actions.fetchScribingQuestion(
        intl.formatMessage(translations.fetchFailureMessage),
      );
    } else {
      actions.fetchSkills();
    }
  }, []);

  if (scribingQuestion.isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <ScribingQuestionForm
        actions={actions}
        data={scribingQuestion}
        initialValues={initialValues}
        intl={intl}
        scribingId={scribingId}
      />
      <NotificationPopup />
    </>
  );
};

ScribingQuestion.propTypes = propTypes;

export default connect(mapStateToProps)(injectIntl(ScribingQuestion));
