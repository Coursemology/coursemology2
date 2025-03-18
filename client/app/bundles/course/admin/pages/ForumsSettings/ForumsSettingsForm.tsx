import { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import { RadioGroup, Typography } from '@mui/material';
import { ForumsSettingsData } from 'types/course/admin/forums';
import { number, object, string } from 'yup';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import commonTranslations from '../../translations';

import translations from './translations';

interface ForumsSettingsFormProps {
  data: ForumsSettingsData;
  onSubmit: (data: ForumsSettingsData) => void;
  disabled?: boolean;
}

const validationSchema = object({
  title: string().nullable(),
  pagination: number()
    .typeError(commonTranslations.paginationMustBePositive)
    .positive(commonTranslations.paginationMustBePositive),
});

const ForumsSettingsForm = forwardRef<
  FormRef<ForumsSettingsData>,
  ForumsSettingsFormProps
>((props, ref): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form
      ref={ref}
      disabled={props.disabled}
      headsUp
      initialValues={props.data}
      onSubmit={props.onSubmit}
      validates={validationSchema}
    >
      {(control): JSX.Element => (
        <Section sticksToNavbar title={t(translations.forumsSettings)}>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={props.disabled}
                field={field}
                fieldState={fieldState}
                fullWidth
                label={t(commonTranslations.title)}
                variant="filled"
              />
            )}
          />

          <Typography
            className="!mb-4 !mt-2"
            color="text.secondary"
            variant="body2"
          >
            {t(commonTranslations.leaveEmptyToUseDefaultTitle)}
          </Typography>

          <Controller
            control={control}
            name="pagination"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={props.disabled}
                field={field}
                fieldState={fieldState}
                fullWidth
                label={t(commonTranslations.pagination)}
                type="number"
                variant="filled"
              />
            )}
          />

          <Subsection spaced title={t(translations.allowStudentsTo)}>
            <Controller
              control={control}
              name="allowAnonymousPost"
              render={({ field, fieldState }): JSX.Element => (
                <FormCheckboxField
                  description={t(translations.allowAnonymousPostDescription)}
                  disabled={props.disabled}
                  field={field}
                  fieldState={fieldState}
                  label={t(translations.allowAnonymousPost)}
                />
              )}
            />
          </Subsection>

          <Subsection
            className="!mt-8"
            spaced
            title={t(translations.markPostAsAnswerSetting)}
          >
            <Controller
              control={control}
              name="markPostAsAnswerSetting"
              render={({ field }): JSX.Element => (
                <RadioGroup {...field} className="space-y-5">
                  <RadioButton
                    className="my-0"
                    description={t(translations.creatorOnlyDescription)}
                    disabled={props.disabled}
                    label={t(translations.creatorOnly)}
                    value="creator_only"
                  />

                  <RadioButton
                    className="my-0"
                    description={t(translations.everyoneDescription)}
                    disabled={props.disabled}
                    label={t(translations.everyone)}
                    value="everyone"
                  />
                </RadioGroup>
              )}
            />
          </Subsection>
        </Section>
      )}
    </Form>
  );
});

ForumsSettingsForm.displayName = 'ForumsSettingsForm';

export default ForumsSettingsForm;
