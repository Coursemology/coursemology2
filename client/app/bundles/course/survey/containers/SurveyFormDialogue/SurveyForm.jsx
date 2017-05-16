import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import Toggle from 'lib/components/redux-form/Toggle';
import formTranslations from 'lib/translations/form';
import translations from 'course/survey/translations';
import { formNames } from 'course/survey/constants';

const styles = {
  title: {
    width: '100%',
  },
  description: {
    width: '100%',
  },
  columns: {
    display: 'flex',
  },
  oneColumn: {
    flex: 1,
  },
  toggle: {
    marginTop: 16,
  },
  hint: {
    fontSize: 14,
    marginBottom: 12,
  },
};

const surveyFormTranslations = defineMessages({
  startEndValidationError: {
    id: 'course.surveys.SurveyForm.startEndValidationError',
    defaultMessage: "Must be after 'Opens At'",
  },
  allowResponseAfterEndHint: {
    id: 'course.surveys.SurveyForm.allowResponseAfterEndHint',
    defaultMessage: 'Allow students to submit responses after the survey has expired. \
      If this is enabled, students who submit before the deadline will get both the base and bonus \
      points, whereas students who submit after the deadline will only be awarded the base points.',
  },
  allowModifyAfterSubmitHint: {
    id: 'course.surveys.SurveyForm.allowModifyAfterSubmitHint',
    defaultMessage: 'Allow students to modify their responses after they have submitted it. If \
      this is disabled, you will have to manually unsubmit their responses to allow them to \
      edit it.',
  },
  anonymousHint: {
    id: 'course.surveys.SurveyForm.anonymousHint',
    defaultMessage: 'If you make the survey anonymous, you will be able to see aggregate survey \
      results but not individual responses. You may not toggle this setting once there is one \
      or more student submissions.',
  },
  hasStudentResponse: {
    id: 'course.surveys.SurveyForm.hasStudentResponse',
    defaultMessage: 'At least one student has responded to this survey. You may not remove anonymity.',
  },
});

const validate = (values) => {
  const errors = {};

  const requiredFields = ['title', 'start_at'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = formTranslations.required;
    }
  });

  if (values.end_at && new Date(values.start_at) >= new Date(values.end_at)) {
    errors.end_at = surveyFormTranslations.startEndValidationError;
  }

  if (values.allow_response_after_end && !values.end_at) {
    errors.end_at = formTranslations.required;
  }

  return errors;
};

const propTypes = {
  formValues: PropTypes.shape({
    start_at: PropTypes.instanceOf(Date),
    end_at: PropTypes.instanceOf(Date),
  }),
  shiftEndDate: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  disableAnonymousToggle: PropTypes.bool,
  disabled: PropTypes.bool,
};

const SurveyForm = ({
  handleSubmit, intl, onSubmit, disabled, disableAnonymousToggle, shiftEndDate, formValues,
}) => (
  <Form onSubmit={handleSubmit(onSubmit)}>
    <Field
      name="title"
      floatingLabelText={intl.formatMessage(translations.title)}
      component={TextField}
      style={styles.title}
      {...{ disabled }}
    />
    <br />
    <Field
      name="description"
      floatingLabelText={intl.formatMessage(translations.description)}
      component={TextField}
      style={styles.description}
      multiLine
      rows={2}
      {...{ disabled }}
    />
    <div style={styles.columns}>
      <Field
        name="start_at"
        floatingLabelText={intl.formatMessage(translations.opensAt)}
        component={DateTimePicker}
        afterChange={(_, newStartAt) => shiftEndDate(formNames.SURVEY, newStartAt, formValues)}
        style={styles.oneColumn}
        {...{ disabled }}
      />
      <Field
        name="end_at"
        floatingLabelText={intl.formatMessage(translations.expiresAt)}
        component={DateTimePicker}
        style={styles.oneColumn}
        {...{ disabled }}
      />
    </div>
    <div style={styles.columns}>
      <div style={styles.oneColumn}>
        <Field
          name="base_exp"
          floatingLabelText={intl.formatMessage(translations.basePoints)}
          component={TextField}
          type="number"
          {...{ disabled }}
        />
      </div>
      {
        formValues && formValues.allow_response_after_end &&
        <div style={styles.oneColumn}>
          <Field
            name="time_bonus_exp"
            floatingLabelText={intl.formatMessage(translations.bonusPoints)}
            component={TextField}
            type="number"
            {...{ disabled }}
          />
        </div>
      }
    </div>
    <Field
      name="allow_response_after_end"
      component={Toggle}
      label={intl.formatMessage(translations.allowResponseAfterEnd)}
      labelPosition="right"
      style={styles.toggle}
      disabled={disabled}
    />
    <div style={styles.hint}>
      { intl.formatMessage(surveyFormTranslations.allowResponseAfterEndHint) }
    </div>
    <Field
      name="allow_modify_after_submit"
      component={Toggle}
      label={intl.formatMessage(translations.allowModifyAfterSubmit)}
      labelPosition="right"
      style={styles.toggle}
      disabled={disabled}
    />
    <div style={styles.hint}>
      { intl.formatMessage(surveyFormTranslations.allowModifyAfterSubmitHint) }
    </div>
    <Field
      name="anonymous"
      component={Toggle}
      label={intl.formatMessage(translations.anonymous)}
      labelPosition="right"
      style={styles.toggle}
      disabled={disableAnonymousToggle || disabled}
    />
    <div style={styles.hint}>
      {
        disableAnonymousToggle ?
        intl.formatMessage(surveyFormTranslations.hasStudentResponse) :
        intl.formatMessage(surveyFormTranslations.anonymousHint)
      }
    </div>
  </Form>
);

SurveyForm.propTypes = propTypes;

export default reduxForm({
  form: formNames.SURVEY,
  validate,
})(injectIntl(SurveyForm));
