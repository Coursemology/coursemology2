import React, { Component, PropTypes } from 'react';
import { FieldArray, reduxForm } from 'redux-form';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

import { TopicProp } from '../../propTypes';
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

  static renderAnswers(props) {
    const { canGrade, topics, fields } = props;
    return (
      <Tabs>
        {fields.map((member, index) => {
          const answer = fields.get(index);
          const topic = topics.filter(t => t.id === answer.id)[0];
          return (
            <Tab key={answer.id} label={index + 1}>
              <SubmissionAnswer {...{ canGrade, member, answer }} />
              <Comments topic={topic} />
              <CommentField />
            </Tab>
          );
        })}
      </Tabs>
    );
  }

  render() {
    const { canGrade, topics, pristine, submitting, handleSubmit } = this.props;
    return (
      <Card style={styles.questionContainer}>
        <form>
          <FieldArray
            name="answers"
            component={SubmissionEditTabForm.renderAnswers}
            {...{ canGrade, topics }}
          />
        </form>
        <hr />
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
          onTouchTap={handleSubmit}
          disabled={pristine || submitting}
        />
      </Card>
    );
  }
}

SubmissionEditTabForm.propTypes = {
  canGrade: PropTypes.bool.isRequired,
  topics: PropTypes.arrayOf(TopicProp),
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  handleSubmit: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditTabForm);
