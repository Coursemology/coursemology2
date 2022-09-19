import { Typography } from '@mui/material';
import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { number, object, string } from 'yup';

import { ForumsSettingsData } from 'types/course/admin/forums';
import useTranslation from 'lib/hooks/useTranslation';
import FormTextField from 'lib/components/form/fields/TextField';
import Section from 'lib/components/layouts/Section';
import Form, { FormEmitter } from 'lib/components/form/Form';
import translations from './translations';
import commonTranslations from '../../translations';

interface ForumsSettingsFormProps extends Emits<FormEmitter> {
  data: ForumsSettingsData;
  onSubmit: (data: ForumsSettingsData) => void;
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
              />
            )}
          />
        </Section>
      )}
    </Form>
  );
};

export default ForumsSettingsForm;
