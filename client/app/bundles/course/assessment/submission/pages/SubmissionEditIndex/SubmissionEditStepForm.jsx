import React, { Component, PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Card } from 'material-ui/Card';
import { Stepper, Step, StepButton, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';

import { SubmissionProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';

const styles = {
  questionContainer: {
    marginTop: 20,
  },
  questionCardContainer: {
    padding: 40,
  },
  formButton: {
    marginRight: 10,
  },
};

class SubmissionEditStepForm extends Component {

  static isLastQuestion(answers, stepIndex) {
    return stepIndex + 1 === answers.length;
  }

  static renderAnswers(props) {
    const { input: { name }, canGrade, answer } = props;
    return (
      <SubmissionAnswer
        key={answer.id}
        {...{ canGrade, member: name, answer }}
      />
    );
  }

  state = {
    stepIndex: 0,
  }

  handleNext() {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
    });
  }

  handleStepClick(index) {
    const { stepIndex } = this.state;
    const { skippable } = this.props;

    if (skippable || index < stepIndex) {
      this.setState({
        stepIndex: index,
      });
    }
  }

  handleQuestionSubmit() {
    const { stepIndex } = this.state;
    const { submission: { answers }, handleSubmit } = this.props;

    handleSubmit();
    if (!SubmissionEditStepForm.isLastQuestion(answers, stepIndex)) {
      this.handleNext();
    }
  }

  renderStepper() {
    const { stepIndex } = this.state;
    const { skippable, submission: { answers } } = this.props;

    if (skippable) {
      return (
        <Stepper activeStep={stepIndex} linear={false}>
          {answers.map((answer, index) =>
            <Step key={answer.id}>
              <StepButton onClick={() => this.handleStepClick(index)} />
            </Step>
          )}
        </Stepper>
      );
    }
    return (
      <Stepper activeStep={stepIndex}>
        {answers.map((answer, index) =>
          <Step key={answer.id} onClick={() => this.handleStepClick(index)}>
            <StepLabel />
          </Step>
        )}
      </Stepper>
    );
  }

  render() {
    const { stepIndex } = this.state;
    const { canGrade, submission: { answers }, pristine, submitting } = this.props;
    return (
      <div style={styles.questionContainer}>
        {this.renderStepper()}
        <Card style={styles.questionCardContainer}>
          <form>
            <Field
              name={`answers[${stepIndex}]`}
              component={SubmissionEditStepForm.renderAnswers}
              {...{ canGrade, answer: answers[stepIndex] }}
            />
          </form>
          <hr />
          <RaisedButton
            style={styles.formButton}
            primary
            label="Save Draft"
            onTouchTap={() => this.handleQuestionSubmit()}
            disabled={pristine || submitting}
          />
          <RaisedButton
            style={styles.formButton}
            secondary
            label="Finalise Submission"
            onTouchTap={() => this.handleQuestionSubmit()}
            disabled={pristine || submitting}
          />
        </Card>
      </div>
    );
  }
}

SubmissionEditStepForm.propTypes = {
  canGrade: PropTypes.bool.isRequired,
  skippable: PropTypes.bool.isRequired,
  submission: SubmissionProp,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  handleSubmit: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditStepForm);
