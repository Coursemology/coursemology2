import React, { Component, PropTypes } from 'react';
import { FieldArray, reduxForm } from 'redux-form';
import { Card } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';

import SubmissionAnswer from '../../components/SubmissionAnswer';

const styles = {
  questionContainer: {
    marginTop: 20,
    padding: 40,
  },
  formButton: {
    marginRight: 10,
  },
};

class SubmissionEditForm extends Component {

  static renderAnswers(props) {
    const { canGrade, fields } = props;
    return (
      <div>
        {fields.map((member, index) => {
          const answer = fields.get(index);
          return <SubmissionAnswer key={answer.id} {...{ canGrade, member, answer }} />;
        })}
      </div>
    );
  }

  render() {
    const { canGrade, pristine, submitting, handleSubmit } = this.props;
    return (
      <Card style={styles.questionContainer}>
        <form>
          <FieldArray
            name="answers"
            component={SubmissionEditForm.renderAnswers}
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
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  handleSubmit: PropTypes.func,
};

export default reduxForm({
  form: 'submissionEdit',
})(SubmissionEditForm);
