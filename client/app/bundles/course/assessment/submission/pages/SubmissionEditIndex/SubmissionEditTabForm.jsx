import React, { Component, PropTypes } from 'react';
import { FieldArray, reduxForm } from 'redux-form';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

import SubmissionAnswer from '../../components/SubmissionAnswer';
import Comments from '../../components/Comments';

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
    const { canGrade, fields } = props;
    return (
      <Tabs>
        {fields.map((member, index) => {
          const answer = fields.get(index);
          return (
            <Tab key={answer.id} label={index}>
              <SubmissionAnswer {...{ canGrade, member, answer }} />
              <Comments />
            </Tab>
          );
        })}
      </Tabs>
    );
  }

  render() {
    const { canGrade, pristine, submitting, handleSubmit } = this.props;
    return (
      <Card style={styles.questionContainer}>
        <form>
          <FieldArray
            name="answers"
            component={SubmissionEditTabForm.renderAnswers}
            {...{ canGrade }}
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
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  handleSubmit: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditTabForm);
