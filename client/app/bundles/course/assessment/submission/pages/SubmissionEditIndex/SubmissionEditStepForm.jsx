import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Card } from 'material-ui/Card';
import { Stepper, Step, StepButton, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';

import { QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import Comments from '../../components/Comments';
import CommentField from '../../components/CommentField';

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

  static isLastQuestion(questions, stepIndex) {
    return stepIndex + 1 === questions.length;
  }

  constructor(props) {
    super(props);
    this.state = {
      stepIndex: props.maxStep,
    };
  }

  handleNext() {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
    });
  }

  handleStepClick(index) {
    const { skippable, maxStep } = this.props;

    if (skippable || index < maxStep) {
      this.setState({
        stepIndex: index,
      });
    }
  }

  handleQuestionSubmit(action) {
    const { stepIndex } = this.state;
    const { questions, handleSubmit } = this.props;

    const questionId = questions.allIds[stepIndex];
    const question = questions.byId[questionId];
    const answerId = question.answerId;

    handleSubmit(answerId, action);
    if (!SubmissionEditStepForm.isLastQuestion(questions.allIds, stepIndex)) {
      this.handleNext();
    }
  }

  renderStepQuestion() {
    const { stepIndex } = this.state;
    const { canGrade, questions, topics } = this.props;

    const id = questions.allIds[stepIndex];
    const question = questions.byId[id];
    const answerId = question.answerId;
    const topic = topics[question.topicId];
    return (
      <div>
        <SubmissionAnswer {...{ canGrade, answerId, question }} />
        <hr />
        <Comments topic={topic} />
        <CommentField />
      </div>
    );
  }

  renderStepper() {
    const { stepIndex } = this.state;
    const { skippable, questions: { allIds: questions } } = this.props;

    if (skippable) {
      return (
        <Stepper activeStep={stepIndex} linear={false}>
          {questions.map((questionId, index) =>
            <Step key={questionId}>
              <StepButton onClick={() => this.handleStepClick(index)} />
            </Step>
          )}
        </Stepper>
      );
    }
    return (
      <Stepper activeStep={stepIndex}>
        {questions.map((questionId, index) =>
          <Step key={questionId} onClick={() => this.handleStepClick(index)}>
            <StepLabel />
          </Step>
        )}
      </Stepper>
    );
  }

  render() {
    const { stepIndex } = this.state;
    const { pristine, questions, submitting } = this.props;
    return (
      <div style={styles.questionContainer}>
        {this.renderStepper()}
        <Card style={styles.questionCardContainer}>
          <form>
            {this.renderStepQuestion()}
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
            label="Submit"
            onTouchTap={() => this.handleQuestionSubmit('auto_grade')}
            disabled={submitting}
          />
          { SubmissionEditStepForm.isLastQuestion(questions, stepIndex) ?
            <RaisedButton
              style={styles.formButton}
              secondary
              label="Finalise Submission"
              onTouchTap={() => this.handleQuestionSubmit('finalise')}
              disabled={pristine || submitting}
            /> : null
          }
        </Card>
      </div>
    );
  }
}

SubmissionEditStepForm.propTypes = {
  canGrade: PropTypes.bool.isRequired,
  maxStep: PropTypes.number.isRequired,
  pristine: PropTypes.bool,
  skippable: PropTypes.bool.isRequired,
  submitting: PropTypes.bool,
  questions: PropTypes.shape({
    byIds: PropTypes.objectOf(QuestionProp),
    allIds: PropTypes.arrayOf(PropTypes.number),
  }),
  topics: PropTypes.objectOf(TopicProp),
  handleSubmit: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditStepForm);
