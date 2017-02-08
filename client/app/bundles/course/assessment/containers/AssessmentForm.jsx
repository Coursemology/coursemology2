import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, Form, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'lib/components/redux-form/TextField';
import RichTextField from 'lib/components/redux-form/RichTextField';
import Toggle from 'lib/components/redux-form/Toggle';
import SelectField from 'lib/components/redux-form/SelectField';
import formTranslations from 'lib/translations/form';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import translations from './AssessmentForm.intl';
import { formNames } from '../constants';

const styles = {
  title: {
    width: '100%',
  },
  description: {
    width: '100%',
  },
  flexGroup: {
    display: 'flex',
  },
  flexChild: {
    flex: 1,
    marginLeft: 10,
  },
  autogradedToggle: {
    marginTop: 24,
  }
};

const validate = (values) => {
  const errors = {};

  const requiredFields = ['title', 'start_at', 'base_exp', 'time_bonus_exp'];
  if (!values.autograded) {
    requiredFields.push('tabbed_view');
  }

  if (values.password_protected) {
    requiredFields.push('password');
  }

  requiredFields.forEach((field) => {
    if (values[field] === undefined || values[field] === '' || values[field] === null) {
      errors[field] = formTranslations.required;
    }
  });

  if (values.start_at && values.end_at && new Date(values.start_at) >= new Date(values.end_at)) {
    errors.end_at = translations.startEndValidationError;
  }

  return errors;
};

class AssessmentForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    autograded: PropTypes.bool,
    password_protected: PropTypes.bool,
    submitting: PropTypes.bool,
    // Above are props from redux-form.
    onSubmit: PropTypes.func.isRequired,
  };

  renderExtraOptions() {
    const { submitting } = this.props;
    if (this.props.autograded) {
      return (
        <Field
          name="skippable"
          component={Toggle}
          label={<FormattedMessage {...translations.skippable} />}
          labelPosition="right"
          disabled={submitting}
        />
      );
    }

    return (
      <div>
        <Field
          name="tabbed_view"
          component={SelectField}
          floatingLabelText={<FormattedMessage {...translations.layout} />}
          floatingLabelFixed
          fullWidth
          type="boolean"
          disabled={submitting}
        >
          <MenuItem
            value={false}
            primaryText={<FormattedMessage {...translations.singlePage} />}
          />
          <MenuItem
            value={true} // eslint-disable-line
            primaryText={<FormattedMessage {...translations.tabbedView} />}
          />
        </Field>
        <Field
          name="delayed_grade_publication"
          component={Toggle}
          label={<FormattedMessage {...translations.delayedGradePublication} />}
          labelPosition="right"
          disabled={submitting}
        />
        <Field
          name="password_protected"
          component={Toggle}
          label={<FormattedMessage {...translations.passwordProtection} />}
          labelPosition="right"
          disabled={submitting}
        />
        {
          this.props.password_protected &&
          <Field
            name="password"
            component={TextField}
            hintText={<FormattedMessage {...translations.password} />}
            fullWidth
            autoComplete={false}
            disabled={submitting}
          />
        }
      </div>
    );
  }

  render() {
    const { handleSubmit, onSubmit, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Field
          name="title"
          component={TextField}
          floatingLabelText={<FormattedMessage {...translations.title} />}
          style={styles.title}
          disabled={submitting}
        />
        <br />
        <Field
          name="description"
          component={RichTextField}
          label={<FormattedMessage {...translations.description} />}
          style={styles.description}
          disabled={submitting}
        />
        <div style={styles.flexGroup}>
          <Field
            name="start_at"
            component={DateTimePicker}
            floatingLabelText={<FormattedMessage {...translations.startAt} />}
            style={styles.flexChild}
            disabled={submitting}
          />
          <Field
            name="end_at"
            component={DateTimePicker}
            floatingLabelText={<FormattedMessage {...translations.endAt} />}
            style={styles.flexChild}
            disabled={submitting}
          />
          <Field
            name="bonus_end_at"
            component={DateTimePicker}
            floatingLabelText={<FormattedMessage {...translations.bonusEndAt} />}
            style={styles.flexChild}
            disabled={submitting}
          />
        </div>
        <div style={styles.flexGroup}>
          <Field
            name="base_exp"
            component={TextField}
            floatingLabelText={<FormattedMessage {...translations.baseExp} />}
            type="number"
            style={styles.flexChild}
            disabled={submitting}
          />
          <Field
            name="time_bonus_exp"
            component={TextField}
            floatingLabelText={<FormattedMessage {...translations.timeBonusExp} />}
            type="number"
            style={styles.flexChild}
            disabled={submitting}
          />
        </div>
        <Field
          name="autograded"
          component={Toggle}
          label={<FormattedMessage {...translations.autograded} />}
          labelPosition="right"
          style={styles.autogradedToggle}
          disabled={submitting}
        />
        {this.renderExtraOptions()}
      </Form>
    );
  }
}

const selector = formValueSelector(formNames.ASSESSMENT);
export default connect(state => selector(state, 'autograded', 'password_protected'))(
  reduxForm({
    form: formNames.ASSESSMENT,
    validate,
  })(AssessmentForm)
);
