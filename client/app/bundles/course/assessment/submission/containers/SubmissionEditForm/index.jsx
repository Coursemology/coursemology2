import React, { Component, PropTypes } from 'react';
import { FieldArray, reduxForm } from 'redux-form';

import SubmissionAnswer from './SubmissionAnswer';

class SubmissionEditForm extends Component {

  static renderAnswers(props) {
    const { canGrade, fields } = props;
    return (
      <div>
        {
          fields.map((member, index) => {
            const answer = fields.get(index);
            return (
              <SubmissionAnswer
                key={answer.id}
                {...{ canGrade, member, index, fields }}
              />
            );
          })
        }
      </div>
    );
  }

  render() {
    const { canGrade, pristine, submitting, handleSubmit } = this.props;
    return (
      <div>
        <form>
          <FieldArray
            name="answers"
            component={SubmissionEditForm.renderAnswers}
            {...{ canGrade }}
          />
        </form>
        <button onClick={handleSubmit} disabled={pristine || submitting}>Save Draft</button>
      </div>
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
