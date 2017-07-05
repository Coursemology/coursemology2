/* eslint-disable react/no-danger */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { red900, yellow900, green900, red300, green500, white } from 'material-ui/styles/colors';

import { ExplanationProp, QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import QuestionGrade from '../../containers/QuestionGrade';
import GradingPanel from '../../containers/GradingPanel';
import Comments from '../../containers/Comments';
import SubmitDialog from '../../components/SubmitDialog';
import UnsubmitDialog from '../../components/UnsubmitDialog';
import ResetDialog from '../../components/ResetDialog';
import { questionTypes } from '../../constants';
import translations from '../../translations';

const styles = {
  questionCardContainer: {
    marginTop: 20,
    padding: 40,
  },
  explanationContainer: {
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 5,
  },
  questionContainer: {
    paddingTop: 10,
  },
  formButton: {
    marginRight: 10,
  },
};

class SubmissionEditForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      submitConfirmation: false,
      unsubmitConfirmation: false,
      resetConfirmation: false,
      resetAnswerId: null,
    };
  }

  renderQuestionGrading(id) {
    const { attempting } = this.props;
    if (!attempting) {
      return <QuestionGrade id={id} />;
    }
    return null;
  }

  renderProgrammingQuestionActions(id) {
    const { intl, attempting, questions, handleAutograde } = this.props;
    const question = questions[id];
    const { answerId } = question;

    if (!attempting) {
      return null;
    }

    if (question.type === questionTypes.Programming) {
      return (
        <div>
          <RaisedButton
            style={styles.formButton}
            backgroundColor={white}
            label={intl.formatMessage(translations.reset)}
            onTouchTap={() => this.setState({ resetConfirmation: true, resetAnswerId: answerId })}
          />
          <RaisedButton
            style={styles.formButton}
            backgroundColor={red900}
            secondary
            label={intl.formatMessage(translations.submit)}
            onTouchTap={() => handleAutograde(answerId)}
          />
        </div>
      );
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

  renderQuestions() {
    const { canGrade, attempting, questionIds, questions, topics } = this.props;
    return (
      <div>
        {questionIds.map((id) => {
          const question = questions[id];
          const { answerId, topicId } = question;
          const topic = topics[topicId];
          return (
            <div key={id} style={styles.questionContainer}>
              <SubmissionAnswer {...{ canGrade, readOnly: !attempting, answerId, question }} />
              {this.renderExplanationPanel(id)}
              {this.renderQuestionGrading(id)}
              {this.renderProgrammingQuestionActions(id)}
              <Comments topic={topic} />
              <hr />
            </div>
          );
        })}
      </div>
    );
  }

  renderGradingPanel() {
    const { attempting } = this.props;
    if (!attempting) {
      return <GradingPanel />;
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

  renderAutogradeSubmissionButton() {
    const { intl, canGrade, submitted, handleAutogradeSubmission } = this.props;
    if (canGrade && submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          primary
          label={intl.formatMessage(translations.autograde)}
          onTouchTap={handleAutogradeSubmission}
        />
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { intl, canUpdate, submitting, attempting } = this.props;
    if (attempting && canUpdate) {
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
    const { intl, canGrade, submitted, published } = this.props;
    if (canGrade && (submitted || published)) {
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

  renderMarkButton() {
    const { intl, delayedGradePublication, canGrade, submitted, handleMark } = this.props;
    if (delayedGradePublication && canGrade && submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={yellow900}
          labelColor={white}
          label={intl.formatMessage(translations.mark)}
          onTouchTap={handleMark}
        />
      );
    }
    return null;
  }

  renderUnmarkButton() {
    const { intl, canGrade, graded, handleUnmark } = this.props;
    if (canGrade && graded) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={yellow900}
          labelColor={white}
          label={intl.formatMessage(translations.unmark)}
          onTouchTap={handleUnmark}
        />
      );
    }
    return null;
  }

  renderPublishButton() {
    const { intl, delayedGradePublication, canGrade, submitted, handlePublish } = this.props;
    if (!delayedGradePublication && canGrade && submitted) {
      return (
        <RaisedButton
          style={styles.formButton}
          backgroundColor={red900}
          secondary
          label={intl.formatMessage(translations.publish)}
          onTouchTap={handlePublish}
        />
      );
    }
    return null;
  }

  renderSubmitDialog() {
    const { submitConfirmation } = this.state;
    const { handleSubmit } = this.props;
    return (
      <SubmitDialog
        open={submitConfirmation}
        onCancel={() => this.setState({ submitConfirmation: false })}
        onConfirm={() => {
          this.setState({ submitConfirmation: false });
          handleSubmit();
        }}
      />
    );
  }

  renderResetDialog() {
    const { resetConfirmation, resetAnswerId } = this.state;
    const { handleReset } = this.props;
    return (
      <ResetDialog
        open={resetConfirmation}
        onCancel={() => this.setState({ resetConfirmation: false, resetAnswerId: null })}
        onConfirm={() => {
          this.setState({ resetConfirmation: false, resetAnswerId: null });
          handleReset(resetAnswerId);
        }}
      />
    );
  }

  renderUnsubmitDialog() {
    const { unsubmitConfirmation } = this.state;
    const { handleUnsubmit } = this.props;
    return (
      <UnsubmitDialog
        open={unsubmitConfirmation}
        onCancel={() => this.setState({ unsubmitConfirmation: false })}
        onConfirm={() => {
          this.setState({ unsubmitConfirmation: false });
          handleUnsubmit();
        }}
      />
    );
  }

  render() {
    return (
      <Card style={styles.questionCardContainer}>
        <form>{this.renderQuestions()}</form>
        {this.renderGradingPanel()}

        {this.renderSaveDraftButton()}
        {this.renderSaveGradeButton()}
        {this.renderAutogradeSubmissionButton()}
        {this.renderSubmitButton()}
        {this.renderUnsubmitButton()}
        {this.renderMarkButton()}
        {this.renderUnmarkButton()}
        {this.renderPublishButton()}

        {this.renderSubmitDialog()}
        {this.renderUnsubmitDialog()}
        {this.renderResetDialog()}
      </Card>
    );
  }
}

SubmissionEditForm.propTypes = {
  intl: intlShape.isRequired,

  canGrade: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  graded: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(QuestionProp),
  topics: PropTypes.objectOf(TopicProp),
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  explanations: PropTypes.objectOf(ExplanationProp),
  delayedGradePublication: PropTypes.bool.isRequired,

  handleAutogradeSubmission: PropTypes.func,
  handleSaveDraft: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleAutograde: PropTypes.func,
  handleReset: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleMark: PropTypes.func,
  handleUnmark: PropTypes.func,
  handlePublish: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(injectIntl(SubmissionEditForm));
