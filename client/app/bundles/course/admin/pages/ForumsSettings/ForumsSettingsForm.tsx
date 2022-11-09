import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { RadioGroup, Typography } from '@mui/material';
import { ForumsSettingsData } from 'types/course/admin/forums';
import { number, object, string } from 'yup';

import RadioButton from 'lib/components/core/buttons/RadioButton';
import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import commonTranslations from '../../translations';

import translations from './translations';

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
      disabled={props.disabled}
      emitsVia={props.emitsVia}
      headsUp={true}
      initialValues={props.data}
      onSubmit={props.onSubmit}
      validates={validationSchema}
    >
      {(control): JSX.Element => (
        <Section sticksToNavbar={true} title={t(translations.forumsSettings)}>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={props.disabled}
                field={field}
                fieldState={fieldState}
                fullWidth={true}
                label={t(commonTranslations.title)}
                variant="filled"
              />
            )}
          />

          <Typography
            className="!mt-2 !mb-4"
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
                fullWidth={true}
                label={t(commonTranslations.pagination)}
                type="number"
                variant="filled"
              />
            )}
          />

          <Subsection
            className="!mt-8"
            spaced={true}
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
};

export default ForumsSettingsForm;
