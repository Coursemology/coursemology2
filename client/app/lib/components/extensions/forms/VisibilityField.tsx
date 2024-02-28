import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Block, Public } from '@mui/icons-material';
import { RadioGroup, Typography } from '@mui/material';

import IconRadio from 'lib/components/core/buttons/IconRadio';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  visibility: {
    id: 'lib.components.extensions.forms.VisibilityField.visibility',
    defaultMessage: 'Visibility',
  },
  published: {
    id: 'lib.components.extensions.forms.VisibilityField.published',
    defaultMessage: 'Published',
  },
  publishedHint: {
    id: 'lib.components.extensions.forms.VisibilityField.publishedHint',
    defaultMessage: 'Everyone can see this item.',
  },
  draft: {
    id: 'lib.components.extensions.forms.VisibilityField.draft',
    defaultMessage: 'Draft',
  },
  draftHint: {
    id: 'lib.components.extensions.forms.VisibilityField.draftHint',
    defaultMessage: 'Only you and staff can see this item.',
  },
});

interface VisibilityFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  disabled?: boolean;
}

const VisibilityField = <T extends FieldValues>(
  props: VisibilityFieldProps<T>,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Typography>{t(translations.visibility)}</Typography>

      <Controller
        control={props.control}
        name={props.name}
        render={({ field }): JSX.Element => (
          <RadioGroup
            {...field}
            onChange={(e): void => {
              const isPublished = e.target.value === 'published';
              field.onChange(isPublished);
            }}
            value={field.value === true ? 'published' : 'draft'}
          >
            <IconRadio
              description={t(translations.publishedHint)}
              disabled={props.disabled}
              icon={Public}
              label={t(translations.published)}
              value="published"
            />

            <IconRadio
              description={t(translations.draftHint)}
              disabled={props.disabled}
              icon={Block}
              label={t(translations.draft)}
              value="draft"
            />
          </RadioGroup>
        )}
      />
    </>
  );
};

export default VisibilityField;
