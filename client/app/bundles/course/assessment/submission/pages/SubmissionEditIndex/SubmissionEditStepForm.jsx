import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { white, green500, green900, red300, red900 } from 'material-ui/styles/colors';
import { Stepper, Step, StepButton, StepLabel } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';

import { PostProp, QuestionProp, TopicProp, ExplanationProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import Comments from '../../components/Comments';
import CommentField from '../../components/CommentField';
import { SAVE_STATES } from '../../constants';

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

  static isLastQuestion(questions, stepIndex) {
    return stepIndex + 1 === questions.allIds.length;
  }

  constructor(props) {
    super(props);
    this.state = {
      stepIndex: props.maxStep,
    };
  }

  shouldRenderContinueButton() {
    const { stepIndex } = this.state;
    const { questions, saveState } = this.props;
    return saveState === SAVE_STATES.Saved && !SubmissionEditStepForm.isLastQuestion(questions, stepIndex);
  }

  shouldDisableContinueButton() {
    const { stepIndex } = this.state;
    const { explanations, questions, submitting } = this.props;
    const questionId = questions.allIds[stepIndex];
    const explanationId = questions.byId[questionId].explanationId;

    if (explanations[explanationId] && explanations[explanationId].correct && !submitting) {
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

    if (skippable || index < maxStep) {
      this.setState({
        stepIndex: index,
      });
    }
  }

  renderExplanationPanel(questionId) {
    const { questions, explanations } = this.props;
    const explanationId = questions.byId[questionId].explanationId;

    if (explanationId) {
      const explanation = explanations[explanationId];
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
            {explanation.explanations.map(exp => <div dangerouslySetInnerHtml={{ __html: exp }} />)}
          </CardText>
        </Card>
      );
    }
    return null;
  }

  renderStepQuestion() {
    const { stepIndex } = this.state;
    const {
      canGrade, posts, questions, topics, pristine, submitting,
      handleAutograde, handleSaveDraft, handleSubmit, handleUnsubmit,
    } = this.props;

    const id = questions.allIds[stepIndex];
    const question = questions.byId[id];
    const answerId = question.answerId;
    const topic = topics[question.topicId];
    const postsInTopic = topic.postIds.map(postId => posts[postId]);
    return (
      <div>
        <SubmissionAnswer {...{ canGrade, answerId, question }} />
        {this.renderExplanationPanel(id)}
        <div style={styles.formButtonContainer}>
          <RaisedButton
            style={styles.formButton}
            secondary
            label="Submit"
            onTouchTap={() => handleAutograde(answerId)}
            disabled={submitting}
          />
          {this.shouldRenderContinueButton() ?
            <RaisedButton
              style={styles.formButton}
              backgroundColor={green500}
              labelColor={white}
              label="Continue"
              onTouchTap={() => this.handleNext()}
              disabled={this.shouldDisableContinueButton()}
            /> : null
          }
          <RaisedButton
            style={styles.formButton}
            primary
            label="Save Draft"
            onTouchTap={() => handleSaveDraft(answerId)}
            disabled={pristine || submitting}
          />
        </div>
        <div style={styles.formButtonContainer}>
          <RaisedButton
            style={styles.formButton}
            secondary
            label="Finalise Submission"
            onTouchTap={handleSubmit}
            disabled={pristine || submitting}
          />
          <RaisedButton
            style={styles.formButton}
            backgroundColor={red900}
            secondary
            label="Unsubmit Submission"
            onTouchTap={handleUnsubmit}
          />
        </div>
        <hr />
        <Comments posts={postsInTopic} />
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
    return (
      <div style={styles.questionContainer}>
        {this.renderStepper()}
        <Card style={styles.questionCardContainer}>
          <form>{this.renderStepQuestion()}</form>
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
  posts: PropTypes.objectOf(PostProp),
  questions: PropTypes.shape({
    byIds: PropTypes.objectOf(QuestionProp),
    allIds: PropTypes.arrayOf(PropTypes.number),
  }),
  topics: PropTypes.objectOf(TopicProp),
  explanations: PropTypes.objectOf(ExplanationProp),
  saveState: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleSaveDraft: PropTypes.func,
  handleAutograde: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditStepForm);
