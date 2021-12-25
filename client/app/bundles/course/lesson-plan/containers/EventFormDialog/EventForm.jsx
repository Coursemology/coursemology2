import { defineMessages, FormattedMessage } from 'react-intl';
import AutoCompleteFilters from 'material-ui/AutoComplete';
import PropTypes from 'prop-types';
import { Field, Form, reduxForm } from 'redux-form';

import { fields, formNames } from 'course/lesson-plan/constants';
import translations from 'course/lesson-plan/translations';
import AutoComplete from 'lib/components/redux-form/AutoComplete';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import RichTextField from 'lib/components/redux-form/RichTextField';
import TextField from 'lib/components/redux-form/TextField';
import Toggle from 'lib/components/redux-form/Toggle';
import formTranslations from 'lib/translations/form';

const {
  TITLE,
  EVENT_TYPE,
  LOCATION,
  DESCRIPTION,
  START_AT,
  END_AT,
  PUBLISHED,
} = fields;

const styles = {
  columns: {
    display: 'flex',
  },
  oneColumn: {
    flex: 1,
  },
  eventType: {
    flex: 1,
    marginRight: 10,
  },
  toggle: {
    marginTop: 16,
  },
};

const validationTranslations = defineMessages({
  startEndValidationError: {
    id: 'course.lessonPlan.EventForm.startEndValidationError',
    defaultMessage: 'Must be after "Start At"',
  },
});

const validate = (values) => {
  const errors = {};

  const requiredFields = ['title', 'start_at', 'event_type'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = formTranslations.required;
    }
  });

  if (
    values.end_at &&
    values.start_at &&
    new Date(values.start_at) >= new Date(values.end_at)
  ) {
    errors.end_at = validationTranslations.startEndValidationError;
  }

  return errors;
};

const EventForm = ({
  handleSubmit,
  onSubmit,
  disabled,
  formValues,
  shiftEndDate,
  eventTypes,
  eventLocations,
}) => (
  <Form onSubmit={handleSubmit(onSubmit)}>
    <Field
      component={TextField}
      floatingLabelText={<FormattedMessage {...translations[TITLE]} />}
      fullWidth={true}
      name="title"
      {...{ disabled }}
    />
    <div style={styles.columns}>
      <Field
        component={AutoComplete}
        dataSource={eventTypes}
        filter={AutoCompleteFilters.caseInsensitiveFilter}
        floatingLabelText={<FormattedMessage {...translations[EVENT_TYPE]} />}
        fullWidth={true}
        menuProps={{ desktop: true }}
        name="event_type"
        openOnFocus={true}
        style={styles.eventType}
        {...{ disabled }}
      />
      <Field
        component={AutoComplete}
        dataSource={eventLocations}
        filter={AutoCompleteFilters.caseInsensitiveFilter}
        floatingLabelText={<FormattedMessage {...translations[LOCATION]} />}
        fullWidth={true}
        menuProps={{ desktop: true }}
        name="location"
        openOnFocus={true}
        style={styles.oneColumn}
        {...{ disabled }}
      />
    </div>
    <Field
      component={RichTextField}
      fullWidth={true}
      label={<FormattedMessage {...translations[DESCRIPTION]} />}
      multiLine={true}
      name="description"
      rows={2}
      {...{ disabled }}
    />
    <div style={styles.columns}>
      <Field
        afterChange={(_, newStartAt) =>
          shiftEndDate(formNames.EVENT, newStartAt, formValues)
        }
        component={DateTimePicker}
        floatingLabelText={<FormattedMessage {...translations[START_AT]} />}
        name="start_at"
        style={styles.oneColumn}
        {...{ disabled }}
      />
      <Field
        component={DateTimePicker}
        floatingLabelText={<FormattedMessage {...translations[END_AT]} />}
        name="end_at"
        style={styles.oneColumn}
        {...{ disabled }}
      />
    </div>
    <Field
      component={Toggle}
      disabled={disabled}
      label={<FormattedMessage {...translations[PUBLISHED]} />}
      labelPosition="right"
      name="published"
      parse={Boolean}
      style={styles.toggle}
    />
  </Form>
);

EventForm.propTypes = {
  eventTypes: PropTypes.arrayOf(PropTypes.string),
  eventLocations: PropTypes.arrayOf(PropTypes.string),
  formValues: PropTypes.shape({}),
  shiftEndDate: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default reduxForm({
  form: formNames.EVENT,
  validate,
})(EventForm);
