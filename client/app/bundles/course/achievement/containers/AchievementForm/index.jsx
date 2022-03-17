import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { reduxForm, Field, Form } from 'redux-form';
import ConditionList from 'lib/components/course/ConditionList';
import renderTextField from 'lib/components/redux-form/TextField';
import RichTextField from 'lib/components/redux-form/RichTextField';
import Toggle from 'lib/components/redux-form/Toggle';
import SingleFileInput, {
  BadgePreview,
} from 'lib/components/redux-form/SingleFileInput';
import formTranslations from 'lib/translations/form';
import { achievementTypesConditionAttributes } from 'lib/types';
import translations from './translations.intl';
import { formNames } from '../../constants';

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
  <Form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
    <Field
      fullWidth
      name="title"
      component={renderTextField}
      label={<FormattedMessage {...translations.title} />}
      disabled={submitting}
    />
    <br />
    <Field
      name="description"
      component={RichTextField}
      label={<FormattedMessage {...translations.description} />}
      disabled={submitting}
    />
    <Field
      name="badge"
      component={SingleFileInput}
      accept="image/*"
      previewComponent={BadgePreview}
      label={<FormattedMessage {...translations.description} />}
      disabled={submitting}
    />
    <Field
      name="published"
      parse={Boolean}
      component={Toggle}
      label={<FormattedMessage {...translations.published} />}
      style={styles.toggle}
      disabled={submitting}
    />
    {editing && conditionAttributes && (
      <div style={styles.conditions}>
        <ConditionList
          newConditionUrls={conditionAttributes.new_condition_urls}
          conditions={conditionAttributes.conditions}
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
