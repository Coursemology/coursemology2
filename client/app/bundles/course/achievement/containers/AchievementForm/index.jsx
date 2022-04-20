import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ConditionList from 'lib/components/course/ConditionList';
import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormSingleFileInput, {
  BadgePreview,
} from 'lib/components/form/fields/SingleFileInput';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import { achievementTypesConditionAttributes } from 'lib/types';
import translations from './translations.intl';

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
  published: yup.bool().required(formTranslations.required),
});

const AchievementForm = (props) => {
  const { conditionAttributes, editing, onSubmit, initialValues, disabled } =
    props;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  return (
    <form
      encType="multipart/form-data"
      id="achievement-form"
      noValidate
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
    >
      <ErrorText errors={errors} />
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.title} />}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            required
            variant="standard"
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <FormRichTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.description} />}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            variant="standard"
          />
        )}
      />
      <Controller
        name="badge"
        control={control}
        render={({ field, fieldState }) => (
          <FormSingleFileInput
            field={field}
            fieldState={fieldState}
            accept="image/*"
            disabled={disabled}
            previewComponent={BadgePreview}
          />
        )}
      />
      <Controller
        name="published"
        control={control}
        render={({ field, fieldState }) => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.published} />}
          />
        )}
      />
      {editing && conditionAttributes && (
        <div>
          <ConditionList
            newConditionUrls={conditionAttributes.new_condition_urls}
            conditions={conditionAttributes.conditions}
          />
        </div>
      )}
    </form>
  );
};

AchievementForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  // If the Form is in editing mode, `Add Conditions` button will be displayed.
  editing: PropTypes.bool,
  // Condtions will be displayed if the attributes are present.
  conditionAttributes: achievementTypesConditionAttributes,
};

export default AchievementForm;
