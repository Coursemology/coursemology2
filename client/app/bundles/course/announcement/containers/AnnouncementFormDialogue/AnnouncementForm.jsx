import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import TextField from 'lib/components/redux-form/TextField';
import RichTextField from 'lib/components/redux-form/RichTextField';
import DateTimePicker from 'lib/components/redux-form/DateTimePicker';
import Toggle from 'lib/components/redux-form/Toggle';
import formTranslations from 'lib/translations/form';
import translations from 'course/announcement/translations';
import { formNames } from 'course/announcement/constants';


const styles = {
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

const validate = (values) => {
  const errors = {};
  const requiredFields = ['title'];

  requiredFields.forEach((field) => {
    if (values[field] === undefined || values[field] === '' || values[field] === null) {
      errors[field] = formTranslations.required;
    }
  });

  return errors;
};

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
};

const AnnouncementForm = ({
  handleSubmit, intl, onSubmit, disabled,
}) => (
  <Form onSubmit={handleSubmit(onSubmit)}>
    <Field
      fullWidth
      name="title"
      component={TextField}
      floatingLabelText={intl.formatMessage(translations.title)}
      {...{ disabled }}
    />
    <br />
    <Field
      name="content"
      component={RichTextField}
      label={intl.formatMessage(translations.content)}
      {...{ disabled }}
    />
    <Field
      name="sticky"
      parse={Boolean}
      component={Toggle}
      label={intl.formatMessage(translations.sticky)}
      labelPosition="right"
      style={styles.toggle}
      {...{ disabled }}
    />
    <Field
      name="start_at"
      component={DateTimePicker}
      floatingLabelText={intl.formatMessage(translations.start_at)}
      style={styles.flexChild}
      {...{ disabled }}
    />
    <Field
      name="end_at"
      component={DateTimePicker}
      floatingLabelText={intl.formatMessage(translations.end_at)}
      style={styles.flexChild}
      {...{ disabled }}
    />
  </Form>
);

AnnouncementForm.propTypes = propTypes;

export default reduxForm({
  form: formNames.ANNOUNCEMENT,
  validate,
})(injectIntl(AnnouncementForm));
