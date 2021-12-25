import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Field, Form, reduxForm } from 'redux-form';

import ConditionList from 'lib/components/course/ConditionList';
import RichTextField from 'lib/components/redux-form/RichTextField';
import SingleFileInput, {
  BadgePreview,
} from 'lib/components/redux-form/SingleFileInput';
import TextField from 'lib/components/redux-form/TextField';
import Toggle from 'lib/components/redux-form/Toggle';
import formTranslations from 'lib/translations/form';
import { achievementTypesConditionAttributes } from 'lib/types';

import { formNames } from '../../constants';

import translations from './translations.intl';

const styles = {
  toggle: {
    marginTop: 16,
  },
  conditions: {
    marginTop: 24,
  },
};

const validate = (values) => {
  const errors = {};
  const requiredFields = ['title'];

  requiredFields.forEach((field) => {
    if (
      values[field] === undefined ||
      values[field] === '' ||
      values[field] === null
    ) {
      errors[field] = formTranslations.required;
    }
  });

  return errors;
};

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  // If the Form is in editing mode, `Add Conditions` button will be displayed.
  editing: PropTypes.bool,
  // Condtions will be displayed if the attributes are present.
  conditionAttributes: achievementTypesConditionAttributes,
};

const AchievementForm = ({
  handleSubmit,
  onSubmit,
  editing,
  submitting,
  conditionAttributes,
}) => (
  <Form encType="multipart/form-data" onSubmit={handleSubmit(onSubmit)}>
    <Field
      component={TextField}
      disabled={submitting}
      floatingLabelText={<FormattedMessage {...translations.title} />}
      fullWidth={true}
      name="title"
    />
    <br />
    <Field
      component={RichTextField}
      disabled={submitting}
      label={<FormattedMessage {...translations.description} />}
      name="description"
    />
    <Field
      accept="image/*"
      component={SingleFileInput}
      disabled={submitting}
      label={<FormattedMessage {...translations.description} />}
      name="badge"
      previewComponent={BadgePreview}
    />
    <Field
      component={Toggle}
      disabled={submitting}
      label={<FormattedMessage {...translations.published} />}
      labelPosition="right"
      name="published"
      parse={Boolean}
      style={styles.toggle}
    />
    {editing && conditionAttributes && (
      <div style={styles.conditions}>
        <ConditionList
          conditions={conditionAttributes.conditions}
          newConditionUrls={conditionAttributes.new_condition_urls}
        />
      </div>
    )}
  </Form>
);

AchievementForm.propTypes = propTypes;

export default reduxForm({
  form: formNames.ACHIEVEMENT,
  validate,
})(AchievementForm);
