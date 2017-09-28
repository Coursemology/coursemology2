import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';
import { touch } from 'redux-form';
import FileIcon from 'material-ui/svg-icons/editor/insert-drive-file';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
import { setNotification } from 'lib/actions';
import { getUrlParameter } from 'lib/helpers/url-helpers';
import ProgressPanel from '../../components/ProgressPanel';
import SubmissionEditForm from './SubmissionEditForm';
import SubmissionEditStepForm from './SubmissionEditStepForm';
import SubmissionEmptyForm from './SubmissionEmptyForm';
import {
  fetchSubmission, autogradeSubmission, saveDraft, finalise,
  unsubmit, submitAnswer, resetAnswer, saveGrade, mark, unmark, publish,
  enterStudentView, exitStudentView,
} from '../../actions';
import {
  assessmentShape, explanationShape, gradingShape, postShape,
  questionFlagsShape, questionShape, reduxFormShape, submissionShape, topicShape,
} from '../../propTypes';
import { formNames, workflowStates } from '../../constants';
import translations from '../../translations';

class VisibleSubmissionEditIndex extends Component {
  constructor(props) {
    super(props);

    const newSubmission = !!getUrlParameter('new_submission') && getUrlParameter('new_submission') === 'true';
    const stepString = getUrlParameter('step');
    const step = isNaN(stepString) || stepString === '' ? null : parseInt(stepString, 10) - 1;

    this.state = { newSubmission, step };
  }

  componentDidMount() {
    const { dispatch, match: { params } } = this.props;
    dispatch(fetchSubmission(params.submissionId));
  }

  allCorrect() {
    const { explanations, questions } = this.props;
    if (Object.keys(explanations).length !== Object.keys(questions).length) {
      return false;
    }

    const numIncorrect = Object.keys(explanations).filter(
      qid => !explanations[qid] || !explanations[qid].correct
    ).length;
    return numIncorrect === 0;
  }

  handleAutogradeSubmission() {
    const { dispatch, match: { params } } = this.props;
    dispatch(autogradeSubmission(params.submissionId));
  }

  validateSubmit = () => {
    const { dispatch, form } = this.props;
    const answers = Object.values(form.values);
    /**
     * Assume there are syncErrors in the form initially.
     * If the user did not change any field, and press submit button directly,
     * all the fields will not be touched, hence, errors will no be shown.
     * Therefore we need to manually touch all the fields
     */
    answers.forEach((answer = {}) => {
      const answerId = answer.id;
      Object.keys(answer).forEach((key) => {
        dispatch(touch(formNames.SUBMISSION, `${answerId}.${key}`));
      });
    });

    const hasError = Object.values(form.syncErrors || {})
      .some(answerError => Object.keys(answerError).length !== 0);

    if (hasError) {
      return Promise.reject();
    }
    return Promise.resolve();
  }

  validateSubmitAnswer = (answerId) => {
    const { dispatch, form } = this.props;
    const answer = form.values[answerId] || {};
    const answerError = form.syncErrors && form.syncErrors[answerId];
    /**
     * Similar reason to validateSubmit.
     * If the user did not change any field, and press submit button directly, we need to manually
     * touch all the fields of the answer, in order to show the syncErrors.
     */
    Object.keys(answer || {}).forEach((key) => {
      dispatch(touch(formNames.SUBMISSION, `${answerId}.${key}`));
    });

    if (Object.keys(answerError || {}).length !== 0) {
      return Promise.reject();
    }
    return Promise.resolve();
  }

  handleSubmit() {
    const { dispatch, form, match: { params } } = this.props;
    const answers = Object.values(form.values);
    return this.validateSubmit()
      .then(() => dispatch(finalise(params.submissionId, answers)),
        () => setNotification(translations.submitError)(dispatch));
  }

  handleUnsubmit() {
    const { dispatch, match: { params } } = this.props;
    dispatch(unsubmit(params.submissionId));
  }

  handleSaveDraft() {
    const { dispatch, form, match: { params } } = this.props;
    const answers = Object.values(form.values);
    dispatch(saveDraft(params.submissionId, answers));
  }

  handleSaveGrade() {
    const { dispatch, match: { params }, grading, exp,
            submission: { workflowState } } = this.props;
    const published = workflowState === workflowStates.Published;
    dispatch(saveGrade(params.submissionId, Object.values(grading), exp, published));
  }

  handleReset(answerId) {
    const { dispatch, form, match: { params } } = this.props;
    const questionId = form.values[answerId].questionId;
    dispatch(resetAnswer(params.submissionId, answerId, questionId));
  }

  handleSubmitAnswer(answerId) {
    const { dispatch, form, match: { params } } = this.props;
    const answer = form.values[answerId] || {};
    return this.validateSubmitAnswer(answerId)
      .then(() => dispatch(submitAnswer(params.submissionId, answer)),
        () => setNotification(translations.submitError)(dispatch));
  }

  handleMark() {
    const { dispatch, match: { params }, grading, exp } = this.props;
    dispatch(mark(params.submissionId, Object.values(grading), exp));
  }

  handleUnmark() {
    const { dispatch, match: { params } } = this.props;
    dispatch(unmark(params.submissionId));
  }

  handlePublish() {
    const { dispatch, match: { params }, grading, exp } = this.props;
    dispatch(publish(params.submissionId, Object.values(grading), exp));
  }

  renderStudentViewToggle() {
    return (
      <Toggle
        label={<FormattedMessage {...translations.studentView} />}
        labelPosition="right"
        onToggle={(_, enabled) => {
          if (enabled) {
            this.props.dispatch(enterStudentView());
          } else {
            this.props.dispatch(exitStudentView());
          }
        }}
      />
    );
  }

  renderAssessment() {
    const { assessment, submission } = this.props;

    const renderFile = (file, index) => (<div key={index}>
      <FileIcon style={{ verticalAlign: 'middle' }} />
      <a href={file.url}><span>{file.name}</span></a>
    </div>);

    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={<h3>{assessment.title}</h3>} />
        {assessment.description ? <CardText
          dangerouslySetInnerHTML={{ __html: assessment.description }}
        /> : null}
        {assessment.files.length > 0 ? (<CardText>
          <h4>Files</h4>
          {assessment.files.map(renderFile)}
        </CardText>) : null}
        <CardActions>
          {submission.isGrader && this.renderStudentViewToggle()}
        </CardActions>
      </Card>
    );
  }

  renderProgress() {
    const { submission } = this.props;
    if (submission.graderView) {
      return <ProgressPanel submission={submission} />;
    }
    return null;
  }

  renderContent() {
    const { newSubmission, step } = this.state;
    const {
      assessment: { autograded, delayedGradePublication, tabbedView,
                    skippable, questionIds, passwordProtected, categoryId, tabId },
      submission: { graderView, canUpdate, maxStep, workflowState },
      explanations,
      grading,
      posts,
      questions,
      questionsFlags,
      topics,
      isAutograding,
      isSaving,
      match: { params: { courseId } },
    } = this.props;

    if (Object.values(questions).length === 0) {
      return (<SubmissionEmptyForm
        courseId={courseId}
        categoryId={categoryId}
        tabId={tabId}
        handleSaveGrade={() => this.handleSaveGrade()}
        handleSubmit={() => this.handleSubmit()}
        handleUnsubmit={() => this.handleUnsubmit()}
        graderView={graderView}
        canUpdate={canUpdate}
        attempting={workflowState === workflowStates.Attempting}
        submitted={workflowState === workflowStates.Submitted}
        published={workflowState === workflowStates.Published}
        isSaving={isSaving}
      />);
    }

    if (autograded) {
      return (
        <SubmissionEditStepForm
          handleSaveDraft={() => this.handleSaveDraft()}
          handleSaveGrade={() => this.handleSaveGrade()}
          handleSubmit={() => this.handleSubmit()}
          handleUnsubmit={() => this.handleUnsubmit()}
          handleSubmitAnswer={answerId => this.handleSubmitAnswer(answerId)}
          handleReset={answerId => this.handleReset(answerId)}
          handleAutogradeSubmission={() => this.handleAutogradeSubmission()}
          explanations={explanations}
          allCorrect={this.allCorrect()}
          graderView={graderView}
          attempting={workflowState === workflowStates.Attempting}
          submitted={workflowState === workflowStates.Submitted}
          published={workflowState === workflowStates.Published}
          maxStep={maxStep}
          step={step}
          skippable={skippable}
          posts={posts}
          questionIds={questionIds}
          questions={questions}
          questionsFlags={questionsFlags}
          topics={topics}
          isSaving={isSaving}
        />
      );
    }
    return (
      <SubmissionEditForm
        handleSaveDraft={() => this.handleSaveDraft()}
        handleSubmit={() => this.handleSubmit()}
        handleUnsubmit={() => this.handleUnsubmit()}
        handleSaveGrade={() => this.handleSaveGrade()}
        handleSubmitAnswer={answerId => this.handleSubmitAnswer(answerId)}
        handleReset={answerId => this.handleReset(answerId)}
        handleAutogradeSubmission={() => this.handleAutogradeSubmission()}
        handleMark={() => this.handleMark()}
        handleUnmark={() => this.handleUnmark()}
        handlePublish={() => this.handlePublish()}
        explanations={explanations}
        grading={grading}
        graderView={graderView}
        canUpdate={canUpdate}
        attempting={workflowState === workflowStates.Attempting}
        submitted={workflowState === workflowStates.Submitted}
        graded={workflowState === workflowStates.Graded}
        newSubmission={newSubmission}
        passwordProtected={passwordProtected}
        published={workflowState === workflowStates.Published}
        posts={posts}
        questionIds={questionIds}
        questions={questions}
        questionsFlags={questionsFlags}
        step={step}
        tabbedView={tabbedView}
        topics={topics}
        delayedGradePublication={delayedGradePublication}
        isAutograding={isAutograding}
        isSaving={isSaving}
      />
    );
  }

  render() {
    const { isLoading, notification } = this.props;

    if (isLoading) {
      return <LoadingIndicator />;
    }
    return (
      <div>
        {this.renderAssessment()}
        {this.renderProgress()}
        {this.renderContent()}
        <NotificationBar notification={notification} />
      </div>
    );
  }
}

VisibleSubmissionEditIndex.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string,
      assessmentId: PropTypes.string,
      submissionId: PropTypes.string,
    }),
  }),
  assessment: assessmentShape,
  exp: PropTypes.number,
  explanations: PropTypes.objectOf(explanationShape),
  form: reduxFormShape,
  grading: gradingShape.isRequired,
  notification: notificationShape,
  posts: PropTypes.objectOf(postShape),
  questions: PropTypes.objectOf(questionShape),
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  submission: submissionShape,
  topics: PropTypes.objectOf(topicShape),
  isAutograding: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    assessment: state.assessment,
    exp: state.grading.exp,
    explanations: state.explanations,
    form: state.form[formNames.SUBMISSION],
    grading: state.grading.questions,
    notification: state.notification,
    posts: state.posts,
    submission: state.submission,
    questions: state.questions,
    questionsFlags: state.questionsFlags,
    isAutograding: state.submissionFlags.isAutograding,
    topics: state.topics,
    isLoading: state.submissionFlags.isLoading,
    isSaving: state.submissionFlags.isSaving,
  };
}

const SubmissionEditIndex = connect(mapStateToProps)(VisibleSubmissionEditIndex);
export default SubmissionEditIndex;
