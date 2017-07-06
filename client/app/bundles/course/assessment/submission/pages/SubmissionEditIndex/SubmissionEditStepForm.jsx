/* eslint-disable react/no-danger */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { white, green500, green900, red300, red900 } from 'material-ui/styles/colors';
import { Stepper, Step, StepButton, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { ExplanationProp, QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import QuestionGrade from '../../containers/QuestionGrade';
import GradingPanel from '../../containers/GradingPanel';
import Comments from '../../containers/Comments';
import { SAVE_STATES, questionTypes } from '../../constants';
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
  formButtonContainer: {
    marginBottom: 20,
  },
  formButton: {
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
    const { questionIds, saveState } = this.props;
    return saveState === SAVE_STATES.Saved &&
      !SubmissionEditStepForm.isLastQuestion(questionIds, stepIndex);
  }

  shouldDisableContinueButton() {
    const { stepIndex } = this.state;
    const { explanations, questionIds, submitting } = this.props;
    const questionId = questionIds[stepIndex];

    if (explanations[questionId] && explanations[questionId].correct && !submitting) {
      return false;
    }
    return true;
  }

  handleNext() {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
    });
  }

  handleStepClick(index) {
    const { skippable, maxStep } = this.props;

    if (skippable || index <= maxStep) {
      this.setState({
        stepIndex: index,
      });
    }
  }

  renderQuestionGrading(id) {
    const { attempting } = this.props;
    if (!attempting) {
      return <QuestionGrade id={id} />;
    }
    return null;
  }

  renderGradingPanel() {
    const { attempting } = this.props;
    if (!attempting) {
      return <GradingPanel />;
    }
    return null;
  }

  renderExplanationPanel(questionId) {
    const { explanations } = this.props;
    const explanation = explanations[questionId];

    if (explanation && explanation.correct !== null) {
      return (
        <Card style={styles.explanationContainer}>
          <CardHeader
            style={{
              ...styles.explanationHeader,
              backgroundColor: explanation.correct ? green500 : red300,
            }}
            title={explanation.correct ? 'Correct!' : 'Wrong!'}
            titleColor={explanation.correct ? green900 : red900}
          />
          <CardText>
            {explanation.explanations.map(exp => <div dangerouslySetInnerHTML={{ __html: exp }} />)}
          </CardText>
        </Card>
      );
    }
    return null;
  }

  renderResetButton() {
    const { stepIndex } = this.state;
    const { intl, questionIds, questions } = this.props;
    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId } = question;

    if (question.type === questionTypes.Programming) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={white}
          label={intl.formatMessage(translations.reset)}
          onTouchTap={() => this.setState({ resetConfirmation: true, resetAnswerId: answerId })}
        />
      );
    }
    return null;
  }

  renderSubmitButton(answerId) {
    const { intl, submitting, attempting, handleAutograde } = this.props;
    return (
      <RaisedButton
        style={styles.formButton}
        secondary
        label={intl.formatMessage(translations.submit)}
        onTouchTap={() => handleAutograde(answerId)}
        disabled={submitting || !attempting}
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

  renderSaveDraftButton() {
    const { intl, pristine, submitting, attempting, handleSaveDraft } = this.props;
    if (attempting) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.saveDraft)}
          onTouchTap={handleSaveDraft}
          disabled={pristine || submitting}
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

  renderFinaliseSubmitButton() {
    const { intl, submitting, attempting, allCorrect } = this.props;
    if (attempting && allCorrect) {
      return (
        <RaisedButton
          style={styles.formButton}
          secondary
          label={intl.formatMessage(translations.finalise)}
          onTouchTap={() => this.setState({ submitConfirmation: true })}
          disabled={submitting}
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
    const { canGrade, attempting, questionIds, questions, topics } = this.props;

    const id = questionIds[stepIndex];
    const question = questions[id];
    const { answerId, topicId } = question;
    const topic = topics[topicId];
    return (
      <div>
        <SubmissionAnswer {...{ canGrade, readOnly: !attempting, answerId, question }} />
        {this.renderExplanationPanel(id)}
        {this.renderQuestionGrading(id)}
        {this.renderGradingPanel()}
        {attempting ? <div style={styles.formButtonContainer}>
          {this.renderResetButton(answerId)}
          {this.renderSubmitButton(answerId)}
          {this.renderContinueButton()}
        </div> : null}
        <div style={styles.formButtonContainer}>
          {this.renderSaveGradeButton()}
          {this.renderSaveDraftButton()}
          {this.renderFinaliseSubmitButton()}
          {this.renderUnsubmitButton()}
        </div>
        <hr />
        <Comments topic={topic} />
      </div>
    );
  }

  renderStepper() {
    const { stepIndex } = this.state;
    const { maxStep } = this.props;
    const { skippable, questionIds } = this.props;

    return (
      <Stepper activeStep={stepIndex} linear={false}>
        {questionIds.map((questionId, index) => {
          if (skippable || index <= maxStep) {
            return (
              <Step key={questionId} active={index <= maxStep}>
                <StepButton onClick={() => this.handleStepClick(index)} />
              </Step>
            );
          }
          return (
            <Step key={questionId}>
              <StepLabel />
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
  submitted: PropTypes.bool.isRequired,

  explanations: PropTypes.objectOf(ExplanationProp),
  allCorrect: PropTypes.bool.isRequired,
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(QuestionProp),
  topics: PropTypes.objectOf(TopicProp),
  saveState: PropTypes.string.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,

  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleSaveDraft: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleAutograde: PropTypes.func,
  handleReset: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(injectIntl(SubmissionEditStepForm));
