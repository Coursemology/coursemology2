import React, { Component, PropTypes } from 'react';
import { FieldArray, reduxForm } from 'redux-form';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

import { TopicProp } from '../../propTypes';
import SubmissionAnswer from '../../components/SubmissionAnswer';
import Comments from '../../components/Comments';
import CommentField from '../../components/CommentField';

const styles = {
  questionCardContainer: {
    marginTop: 20,
    padding: 40,
  },
  questionContainer: {
    paddingTop: 10,
  },
  formButton: {
    marginRight: 10,
  },
};

class SubmissionEditForm extends Component {

  static renderAnswers(props) {
    const { canGrade, topics, fields } = props;
    return (
      <div>
        {fields.map((member, index) => {
          const answer = fields.get(index);
          const topic = topics.filter(t => t.id === answer.id)[0];
          return (
            <div key={answer.id} style={styles.questionContainer}>
              <SubmissionAnswer {...{ canGrade, member, answer }} />
              <Comments topic={topic} />
              <CommentField />
              <hr />
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { canGrade, topics, pristine, submitting, handleSubmit } = this.props;
    return (
      <Card style={styles.questionCardContainer}>
        <form>
          <FieldArray
            name="answers"
            component={SubmissionEditForm.renderAnswers}
            {...{ canGrade, topics }}
          />
        </form>
        <RaisedButton
          style={styles.formButton}
          primary
          label="Save Draft"
          onTouchTap={handleSubmit}
          disabled={pristine || submitting}
        />
        <RaisedButton
          style={styles.formButton}
          secondary
          label="Finalise Submission"
          onTouchTap={() => handleSubmit('finalise')}
          disabled={submitting}
        />
        <RaisedButton
          style={styles.formButton}
          secondary
          label="Unsubmit Submission"
          onTouchTap={() => handleSubmit('unsubmit')}
          disabled={submitting}
        />
      </Card>
    );
  }
}

SubmissionEditForm.propTypes = {
  canGrade: PropTypes.bool.isRequired,
  topics: PropTypes.arrayOf(TopicProp),
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  handleSubmit: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditForm);
