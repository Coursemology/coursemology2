import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import FormSingleFileInput, {
  FilePreview,
} from 'lib/components/form/fields/SingleFileInput';
import ErrorText from 'lib/components/core/ErrorText';
import { LoadingButton } from '@mui/lab';
import { Grid, Button, Typography } from '@mui/material';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { InvitationFileEntity } from 'types/course/userInvitations';

interface Props extends WrappedComponentProps {
  onSubmit: (data: InvitationFileEntity, setError: unknown) => void;
  handleClose: (isDirty: boolean) => void;
  setIsDirty?: (value: boolean) => void;
  initialValues?: Object;
  isLoading: boolean;
}

interface IFormInputs {
  file: { name: string; url: string };
}

const translations = defineMessages({
  invite: {
    id: 'course.userInvitation.fileUpload.invite',
    defaultMessage: 'Invite Users from File',
  },
  header: {
    id: 'course.userInvitation.fileUpload.header',
    defaultMessage: 'File Upload (.csv)',
  },
  cancel: {
    id: 'course.userInvitation.fileUpload.cancel',
    defaultMessage: 'Cancel',
  },
});

const FileUploadForm: FC<Props> = (props) => {
  const { onSubmit, handleClose, setIsDirty, initialValues, isLoading, intl } =
    props;
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
      <Typography variant="body2">
        <strong>{intl.formatMessage(translations.header)}</strong>
      </Typography>
      <form
        encType="multipart/form-data"
        id="invite-users-file-upload-form"
        noValidate
        onSubmit={handleSubmit((data: IFormInputs) =>
          onSubmit(data.file, setError),
        )}
      >
        <ErrorText errors={errors} />
        <Controller
          name="file"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormSingleFileInput
              disabled={isLoading}
              field={field}
              fieldState={fieldState}
              accept={{ 'text/csv': [] }}
              previewComponent={FilePreview}
            />
          )}
        />
      </form>
      <Grid container justifyContent="space-between" sx={{ marginTop: '24px' }}>
        <LoadingButton
          loading={isLoading}
          disabled={disabled}
          variant="contained"
          className="btn-submit file-upload-submit"
          form="invite-users-file-upload-form"
          key="invite-users-file-upload-form-submit-button"
          type="submit"
        >
          {intl.formatMessage(translations.invite)}
        </LoadingButton>
        <Button
          color="secondary"
          onClick={(): void => handleClose(isDirty)}
          disabled={isLoading}
        >
          {intl.formatMessage(translations.cancel)}
        </Button>
      </Grid>
    </>
  );
};

export default injectIntl(FileUploadForm);
