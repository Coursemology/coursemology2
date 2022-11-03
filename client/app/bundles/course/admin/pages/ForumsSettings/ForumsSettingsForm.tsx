import { RadioGroup, Typography } from '@mui/material';
import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { number, object, string } from 'yup';

import { ForumsSettingsData } from 'types/course/admin/forums';
import useTranslation from 'lib/hooks/useTranslation';
import FormTextField from 'lib/components/form/fields/TextField';
import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import Form, { FormEmitter } from 'lib/components/form/Form';
import translations from './translations';
import commonTranslations from '../../translations';

interface ForumsSettingsFormProps extends Emits<FormEmitter> {
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

const ForumsSettingsForm = (props: ForumsSettingsFormProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form
      initialValues={props.data}
      emitsVia={props.emitsVia}
      onSubmit={props.onSubmit}
      validates={validationSchema}
      headsUp
      disabled={props.disabled}
    >
      {(control): JSX.Element => (
        <Section title={t(translations.forumsSettings)} sticksToNavbar>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                variant="filled"
                label={t(commonTranslations.title)}
                fullWidth
                disabled={props.disabled}
              />
            )}
          />

          <Typography
            variant="body2"
            color="text.secondary"
            className="!mt-2 !mb-4"
          >
            {t(commonTranslations.leaveEmptyToUseDefaultTitle)}
          </Typography>

          <Controller
            name="pagination"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                variant="filled"
                label={t(commonTranslations.pagination)}
                type="number"
                fullWidth
                disabled={props.disabled}
              />
            )}
          />

          <Subsection
            title={t(translations.markPostAsAnswerSetting)}
            className="!mt-8"
            spaced
          >
            <Controller
              name="markPostAsAnswerSetting"
              control={control}
              render={({ field }): JSX.Element => (
                <RadioGroup {...field} className="space-y-5">
                  <RadioButton
                    value="creator_only"
                    label={t(translations.creatorOnly)}
                    description={t(translations.creatorOnlyDescription)}
                    className="my-0"
                    disabled={props.disabled}
                  />

                  <RadioButton
                    value="everyone"
                    label={t(translations.everyone)}
                    description={t(translations.everyoneDescription)}
                    className="my-0"
                    disabled={props.disabled}
                  />
                </RadioGroup>
              )}
            />
          </Subsection>
        </Section>
      )}
    </Form>
  );
};

export default ForumsSettingsForm;
