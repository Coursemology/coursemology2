/* eslint-disable react/no-danger */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import { white, red100, red200, red900, green200, green500, green900,
         lightBlue400, blue800 } from 'material-ui/styles/colors';
import { Stepper, Step, StepButton, StepLabel } from 'material-ui/Stepper';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import SvgIcon from 'material-ui/SvgIcon';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { ExplanationProp, QuestionProp, QuestionFlagsProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import QuestionGrade from '../../containers/QuestionGrade';
import GradingPanel from '../../containers/GradingPanel';
import Comments from '../../containers/Comments';
import { formNames, questionTypes } from '../../constants';
import translations from '../../translations';

const styles = {
  questionContainer: {
    marginTop: 20,
  },
  questionCardContainer: {
    padding: 40,
  },
  explanationContainer: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 5,
  },
  explanationHeader: {
    borderRadius: '5px 5px 0 0',
    padding: 12,
  },
  formButton: {
    marginBottom: 10,
    marginRight: 10,
  },
};

class SubmissionEditStepForm extends Component {

  static isLastQuestion(questionIds, stepIndex) {
    return stepIndex + 1 === questionIds.length;
  }

  constructor(props) {
    super(props);
    this.state = {
      maxStep: props.maxStep,
      stepIndex: props.maxStep,
      submitConfirmation: false,
      unsubmitConfirmation: false,
      resetConfirmation: false,
    };
  }

  componentDidMount() {
    this.updateScreenWidth();
    window.addEventListener('resize', () => this.updateScreenWidth());
  }

  componentWillUnmount() {
    window.removeEventListener('resize', () => this.updateScreenWidth());
  }

  updateScreenWidth() {
    this.setState({ width: window.innerWidth });
  }

  shouldRenderContinueButton() {
    const { stepIndex } = this.state;
    const { questionIds } = this.props;
    return !SubmissionEditStepForm.isLastQuestion(questionIds, stepIndex);
  }

  shouldDisableContinueButton() {
    const { stepIndex } = this.state;
    const { explanations, questionIds, isSaving } = this.props;
    const questionId = questionIds[stepIndex];

    if (isSaving) {
      return true;
    }

    if (explanations[questionId] && explanations[questionId].correct) {
      return false;
    }
    return true;
  }

  handleNext() {
    const { maxStep, stepIndex } = this.state;
    this.setState({
      maxStep: Math.max(maxStep, stepIndex + 1),
      stepIndex: stepIndex + 1,
    });
  }

  handleStepClick(index) {
    const { skippable } = this.props;
    const { maxStep } = this.state;

    if (skippable || index <= maxStep) {
      this.setState({
        stepIndex: index,
      });
    }
  }

  renderQuestionGrading(id) {
    const { attempting, published, canGrade } = this.props;
    const editable = !attempting && canGrade;
    const visible = editable || published;

    return visible ? <QuestionGrade id={id} editable={editable} /> : null;
  }

  renderGradingPanel() {
    const { attempting } = this.props;
    if (!attempting) {
      return <GradingPanel />;
    }
    return null;
  }

  renderExplanationPanel(question) {
    const { intl, explanations } = this.props;
    const explanation = explanations[question.id];

    if (explanation && explanation.correct !== null) {
      if (question.type === questionTypes.Programming && explanation.correct) {
        return null;
      }

      let title = '';
      if (explanation.correct) {
        title = intl.formatMessage(translations.correct);
      } else if (explanation.failureType === 'public_test') {
        title = intl.formatMessage(translations.publicTestCaseFailure);
      } else if (explanation.failureType === 'private_test') {
        title = intl.formatMessage(translations.privateTestCaseFailure);
      } else {
        title = intl.formatMessage(translations.wrong);
      }

      /* eslint-disable react/no-array-index-key */
      return (
        <Card style={styles.explanationContainer}>
          <CardHeader
            style={{
              ...styles.explanationHeader,
              backgroundColor: explanation.correct ? green200 : red200,
            }}
            title={title}
            titleColor={explanation.correct ? green900 : red900}
          />
          <CardText>
            {explanation.explanations.map((exp, idx) => <div key={idx} dangerouslySetInnerHTML={{ __html: exp }} />)}
          </CardText>
        </Card>
      );
      /* eslint-enable react/no-array-index-key */
    }
    return null;
  }

  renderAutogradingErrorPanel(id) {
    const { intl, questionsFlags } = this.props;
    const { hasError } = questionsFlags[id] || {};

    if (hasError) {
      return (
        <Paper style={{ padding: 10, backgroundColor: red100, marginBottom: 20 }}>
          {intl.formatMessage(translations.autogradeFailure)}
        </Paper>
      );
    }

    return null;
  }

  renderResetButton() {
    const { stepIndex } = this.state;
    const { intl, questionIds, questions, questionsFlags, isSaving } = this.props;
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;
    const { isAutograding, isResetting } = questionsFlags[id] || {};

    if (question.type === questionTypes.Programming) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={white}
          label={intl.formatMessage(translations.reset)}
          onTouchTap={() => this.setState({ resetConfirmation: true, resetAnswerId: answerId })}
          disabled={isAutograding || isResetting || isSaving}
        />
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { stepIndex } = this.state;
    const { intl, questionIds, questions, questionsFlags, handleAutograde, isSaving } = this.props;
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;
    const { isAutograding, isResetting } = questionsFlags[id] || {};
    return (
      <RaisedButton
        style={styles.formButton}
        secondary
        label={intl.formatMessage(translations.submit)}
        onTouchTap={() => handleAutograde(answerId)}
        disabled={isAutograding || isResetting || isSaving}
      />
    );
  }

  renderContinueButton() {
    const { intl } = this.props;
    if (this.shouldRenderContinueButton()) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={green500}
          labelColor={white}
          label={intl.formatMessage(translations.continue)}
          onTouchTap={() => this.handleNext()}
          disabled={this.shouldDisableContinueButton()}
        />
      );
    }
    return null;
  }

  renderAnswerLoadingIndicator() {
    const { stepIndex } = this.state;
    const { questionIds, questionsFlags } = this.props;
    const id = questionIds[stepIndex];
    const { isAutograding, isResetting } = questionsFlags[id] || {};

    if (isAutograding || isResetting) {
      return <CircularProgress size={36} style={{ position: 'absolute' }} />;
    }
    return null;
  }

  renderSaveDraftButton() {
    const { intl, pristine, attempting, handleSaveDraft, isSaving } = this.props;
    if (attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.saveDraft)}
          onTouchTap={handleSaveDraft}
          disabled={pristine || isSaving}
        />
      );
    }
    return null;
  }

  renderSaveGradeButton() {
    const { intl, canGrade, attempting, handleSaveGrade } = this.props;
    if (canGrade && !attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.saveGrade)}
          onTouchTap={handleSaveGrade}
        />
      );
    }
    return null;
  }

  renderFinaliseButton() {
    const { intl, attempting, allCorrect, isSaving } = this.props;
    if (attempting && allCorrect) {
      return (
        <RaisedButton
          style={styles.formButton}
          secondary
          label={intl.formatMessage(translations.finalise)}
          onTouchTap={() => this.setState({ submitConfirmation: true })}
          disabled={isSaving}
        />
      );
    }
    return null;
  }

  renderUnsubmitButton() {
    const { intl, canGrade, attempting } = this.props;
    if (canGrade && !attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label={intl.formatMessage(translations.unsubmit)}
          onTouchTap={() => this.setState({ unsubmitConfirmation: true })}
        />
      );
    }
    return null;
  }

  renderStepQuestion() {
    const { stepIndex } = this.state;
    const { attempting, questionIds, questions, topics } = this.props;

    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId, topicId } = question;
    const topic = topics[topicId];
    return (
      <div>
        <SubmissionAnswer {...{ readOnly: !attempting, answerId, question }} />
        {this.renderAutogradingErrorPanel(id)}
        {this.renderExplanationPanel(question)}
        {this.renderQuestionGrading(id)}
        {this.renderGradingPanel()}
        {attempting ? <div>
          {this.renderResetButton()}
          {this.renderSubmitButton()}
          {this.renderContinueButton()}
          {this.renderAnswerLoadingIndicator()}
        </div> : null}
        <div>
          {this.renderSaveGradeButton()}
          {this.renderSaveDraftButton()}
          {this.renderFinaliseButton()}
          {this.renderUnsubmitButton()}
        </div>
        <hr />
        <Comments topic={topic} />
      </div>
    );
  }

  renderStepper() {
    const { maxStep, stepIndex } = this.state;
    const { skippable, questionIds } = this.props;

    return (
      <Stepper activeStep={stepIndex} linear={false} connector={<div />} style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        {questionIds.map((questionId, index) => {
          if (skippable || index <= maxStep) {
            return (
              <Step key={questionId} active={index <= maxStep}>
                <StepButton
                  iconContainerStyle={{ padding: 0 }}
                  icon={
                    <SvgIcon color={index === stepIndex ? blue800 : lightBlue400}>
                      <circle cx="12" cy="12" r="12" />
                      <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#fff">
                        {index + 1}
                      </text>
                    </SvgIcon>
                  }
                  onClick={() => this.handleStepClick(index)}
                />
              </Step>
            );
          }
          return (
            <Step key={questionId}>
              <StepLabel iconContainerStyle={{ padding: 0 }} />
            </Step>
          );
        })}
      </Stepper>
    );
  }

  renderSubmitDialog() {
    const { submitConfirmation } = this.state;
    const { intl, handleSubmit } = this.props;
    return (
      <ConfirmationDialog
        open={submitConfirmation}
        onCancel={() => this.setState({ submitConfirmation: false })}
        onConfirm={() => {
          this.setState({ submitConfirmation: false });
          handleSubmit();
        }}
        message={intl.formatMessage(translations.submitConfirmation)}
      />
    );
  }

  renderUnsubmitDialog() {
    const { unsubmitConfirmation } = this.state;
    const { intl, handleUnsubmit } = this.props;
    return (
      <ConfirmationDialog
        open={unsubmitConfirmation}
        onCancel={() => this.setState({ unsubmitConfirmation: false })}
        onConfirm={() => {
          this.setState({ unsubmitConfirmation: false });
          handleUnsubmit();
        }}
        message={intl.formatMessage(translations.unsubmitConfirmation)}
      />
    );
  }

  renderResetDialog() {
    const { resetConfirmation, resetAnswerId } = this.state;
    const { intl, handleReset } = this.props;
    return (
      <ConfirmationDialog
        open={resetConfirmation}
        onCancel={() => this.setState({ resetConfirmation: false, resetAnswerId: null })}
        onConfirm={() => {
          this.setState({ resetConfirmation: false, resetAnswerId: null });
          handleReset(resetAnswerId);
        }}
        message={intl.formatMessage(translations.resetConfirmation)}
      />
    );
  }

  render() {
    return (
      <div style={styles.questionContainer}>
        {this.renderStepper()}
        <Card style={styles.questionCardContainer}>
          <form>{this.renderStepQuestion()}</form>
        </Card>
        {this.renderSubmitDialog()}
        {this.renderUnsubmitDialog()}
        {this.renderResetDialog()}
      </div>
    );
  }
}

SubmissionEditStepForm.propTypes = {
  intl: intlShape.isRequired,

  canGrade: PropTypes.bool.isRequired,
  maxStep: PropTypes.number.isRequired,
  skippable: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

  explanations: PropTypes.objectOf(ExplanationProp),
  allCorrect: PropTypes.bool.isRequired,
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(QuestionProp),
  questionsFlags: PropTypes.objectOf(QuestionFlagsProp),
  topics: PropTypes.objectOf(TopicProp),
  isSaving: PropTypes.bool.isRequired,
  pristine: PropTypes.bool,

  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleSaveDraft: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleAutograde: PropTypes.func,
  handleReset: PropTypes.func,
};

export default reduxForm({
  form: formNames.SUBMISSION,
})(injectIntl(SubmissionEditStepForm));
