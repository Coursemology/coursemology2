import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { Typography } from '@mui/material';
import { CommentsSettingsData } from 'types/course/admin/comments';
import { number, object, string } from 'yup';

import Section from 'lib/components/core/layouts/Section';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import commonTranslations from '../../translations';

import translations from './translations';

interface CommentsSettingsFormProps
  extends Emits<FormEmitter<CommentsSettingsData>> {
  data: CommentsSettingsData;
  onSubmit: (data: CommentsSettingsData) => void;
  disabled?: boolean;
}

const validationSchema = object({
  title: string().nullable(),
  pagination: number()
    .typeError(commonTranslations.paginationMustBePositive)
    .positive(commonTranslations.paginationMustBePositive),
});

const CommentsSettingsForm = (
  props: CommentsSettingsFormProps,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form
      disabled={props.disabled}
      emitsVia={props.emitsVia}
      headsUp
      initialValues={props.data}
      onSubmit={props.onSubmit}
      validates={validationSchema}
    >
      {(control): JSX.Element => (
        <Section sticksToNavbar title={t(translations.commentsSettings)}>
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
        </Section>
      )}
    </Form>
  );
};

export default CommentsSettingsForm;
