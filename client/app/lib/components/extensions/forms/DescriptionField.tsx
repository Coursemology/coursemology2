import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import FormRichTextField from 'lib/components/form/fields/RichTextField';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  description: {
    id: 'lib.components.extensions.forms.DescriptionField.description',
    defaultMessage: 'Description',
  },
});

interface DescriptionFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  disabled?: boolean;
}

const DescriptionField = <T extends FieldValues>(
  props: DescriptionFieldProps<T>,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Typography>{t(translations.description)}</Typography>

      <Controller
        control={props.control}
        name={props.name}
        render={({ field, fieldState }): JSX.Element => (
          <FormRichTextField
            disabled={props.disabled}
            disableMargins
            field={field}
            fieldState={fieldState}
            fullWidth
            variant="standard"
          />
        )}
      />
    </>
  );
};

export default DescriptionField;
