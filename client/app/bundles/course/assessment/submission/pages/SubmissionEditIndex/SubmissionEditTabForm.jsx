import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { red900 } from 'material-ui/styles/colors';

import { PostProp, QuestionProp, TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import Comments from '../../components/Comments';
import CommentField from '../../components/CommentField';

const styles = {
  questionContainer: {
    marginTop: 20,
    padding: 20,
  },
  formButton: {
    marginRight: 10,
  },
};

class SubmissionEditTabForm extends Component {

  renderQuestions() {
    const { canGrade, posts, questions, topics } = this.props;
    return (
      <Tabs>
        {questions.allIds.map((id, index) => {
          const question = questions.byId[id];
          const answerId = question.answerId;
          const topic = topics[question.topicId];
          const postsInTopic = topic.postIds.map(postId => posts[postId]);
          return (
            <Tab key={id} label={index + 1}>
              <SubmissionAnswer {...{ canGrade, answerId, question }} />
              <Comments posts={postsInTopic} />
              <CommentField />
            </Tab>
          );
        })}
      </Tabs>
    );
  }

  render() {
    const { pristine, submitting, handleSaveDraft, handleSubmit, handleUnsubmit } = this.props;
    return (
      <Card style={styles.questionContainer}>
        <form>{this.renderQuestions()}</form>
        <hr />
        <RaisedButton
          style={styles.formButton}
          primary
          label="Save Draft"
          onTouchTap={handleSaveDraft}
          disabled={pristine || submitting}
        />
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
          disabled={submitting}
        />
      </Card>
    );
  }
}

SubmissionEditTabForm.propTypes = {
  canGrade: PropTypes.bool.isRequired,
  posts: PropTypes.objectOf(PostProp),
  questions: PropTypes.shape({
    byIds: PropTypes.objectOf(QuestionProp),
    allIds: PropTypes.arrayOf(PropTypes.number),
  }),
  topics: PropTypes.objectOf(TopicProp),
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  handleSaveDraft: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditTabForm);
