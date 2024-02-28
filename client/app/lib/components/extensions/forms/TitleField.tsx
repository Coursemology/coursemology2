import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { defineMessages } from 'react-intl';

import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  title: {
    id: 'lib.components.extensions.forms.TitleField.title',
    defaultMessage: 'Title',
  },
});

interface TitleFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  disabled?: boolean;
}

const TitleField = <T extends FieldValues>(
  props: TitleFieldProps<T>,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Controller
      control={props.control}
      name={props.name}
      render={({ field, fieldState }) => (
        <FormTextField
          disabled={props.disabled}
          disableMargins
          field={field}
          fieldState={fieldState}
          fullWidth
          label={t(translations.title)}
          required
          variant="filled"
        />
      )}
    />
  );
};

export default TitleField;
