import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ErrorText from 'lib/components/ErrorText';
import { LoadingButton } from '@mui/lab';
import { Grid, Button, TextField, Stack } from '@mui/material';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import FormTextField from 'lib/components/form/fields/TextField';
import tableTranslations from 'lib/translations/table';
import { RoleRequestRowData } from 'types/system/instance/roleRequests';

interface Props extends WrappedComponentProps {
  onSubmit: (data: string, setError: unknown) => void;
  handleClose: (isDirty: boolean) => void;
  setIsDirty?: (value: boolean) => void;
  roleRequest: RoleRequestRowData;
  isLoading: boolean;
}

interface IFormInputs {
  rejectionMessage: string;
}

const translations = defineMessages({
  reject: {
    id: 'roleRequests.reject',
    defaultMessage: 'Reject and send message',
  },
  cancel: {
    id: 'roleRequests.cancel',
    defaultMessage: 'Cancel',
  },
});

const RejectWithMessageForm: FC<Props> = (props) => {
  const { onSubmit, handleClose, setIsDirty, roleRequest, isLoading, intl } =
    props;

  const initialValues = {
    rejectionMessage: '',
  };

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<IFormInputs>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (setIsDirty) {
      if (isDirty) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    }
  }, [isDirty]);

  const disabled = isSubmitting || !isDirty;
  return (
    <>
      <form
        encType="multipart/form-data"
        id="reject-with-message-form"
        noValidate
        onSubmit={handleSubmit((data: IFormInputs) =>
          onSubmit(data.rejectionMessage, setError),
        )}
      >
        <ErrorText errors={errors} />
        <Stack spacing={2}>
          <TextField
            disabled
            required
            fullWidth
            label={intl.formatMessage(tableTranslations.name)}
            defaultValue={roleRequest.name}
            variant="standard"
          />
          <TextField
            disabled
            required
            fullWidth
            label={intl.formatMessage(tableTranslations.email)}
            defaultValue={roleRequest.email}
            variant="standard"
          />
          <TextField
            disabled
            required
            fullWidth
            label={intl.formatMessage(tableTranslations.requestToBe)}
            defaultValue={roleRequest.role}
            variant="standard"
          />
          <TextField
            disabled
            fullWidth
            label={intl.formatMessage(tableTranslations.organization)}
            defaultValue={roleRequest.organization}
            variant="standard"
          />
          <TextField
            disabled
            fullWidth
            label={intl.formatMessage(tableTranslations.designation)}
            defaultValue={roleRequest.designation}
            variant="standard"
          />
          <TextField
            disabled
            fullWidth
            label={intl.formatMessage(tableTranslations.reason)}
            defaultValue={roleRequest.reason}
            variant="standard"
          />
          <Controller
            name="rejectionMessage"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                label={intl.formatMessage(tableTranslations.rejectionMessage)}
                // @ts-ignore: component is still written in JS
                className="rejectionMessage"
                fullWidth
                multiline
                rows={2}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="standard"
              />
            )}
          />
        </Stack>
      </form>
      <Grid container className="mt-6" justifyContent="space-between">
        <Button
          color="secondary"
          onClick={(): void => handleClose(isDirty)}
          disabled={isLoading}
        >
          {intl.formatMessage(translations.cancel)}
        </Button>
        <LoadingButton
          loading={isLoading}
          disabled={disabled}
          variant="contained"
          className="btn-submit reject-with-message-submit"
          form="reject-with-message-form"
          key="reject-with-message-form-submit-button"
          type="submit"
        >
          {intl.formatMessage(translations.reject)}
        </LoadingButton>
      </Grid>
    </>
  );
};

export default injectIntl(RejectWithMessageForm);
