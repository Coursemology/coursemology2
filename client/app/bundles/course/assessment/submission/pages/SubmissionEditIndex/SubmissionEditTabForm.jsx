import React, { Component, PropTypes } from 'react';
import { FieldArray, reduxForm } from 'redux-form';
import { Tabs, Tab } from 'material-ui/Tabs';

import SubmissionAnswer from '../../components/SubmissionAnswer';

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
            </Tab>
          );
        })}
      </Tabs>
    );
  }

  render() {
    const { canGrade, pristine, submitting, handleSubmit } = this.props;
    return (
      <div>
        <form>
          <FieldArray
            name="answers"
            component={SubmissionEditTabForm.renderAnswers}
            {...{ canGrade }}
          />
        </form>
        <button onClick={handleSubmit} disabled={pristine || submitting}>
          Finalise Submission
        </button>
      </div>
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
