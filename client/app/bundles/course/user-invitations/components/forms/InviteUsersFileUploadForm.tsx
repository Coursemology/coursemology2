import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import FormSingleFileInput, {
  FilePreview,
} from 'lib/components/form/fields/SingleFileInput';
import { defineMessages } from 'react-intl';
import { InvitationFileEntity } from 'types/course/userInvitations';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  open: boolean;
  onSubmit: (
    data: InvitationFileEntity,
    setError: UseFormSetError<IFormInputs>,
  ) => void;
  onClose: () => void;
  formSubtitle: JSX.Element;
}

interface IFormInputs {
  file: { name: string; url: string };
}

const initialValues = {
  file: { name: '', url: '', file: undefined },
};

const translations = defineMessages({
  fileUpload: {
    id: 'course.userInvitation.fileUpload',
    defaultMessage: 'File Upload',
  },
  invite: {
    id: 'course.userInvitation.fileUpload.invite',
    defaultMessage: 'Invite Users from File',
  },
  fileUploadField: {
    id: 'course.userInvitation.fileUploadField',
    defaultMessage: 'File Upload (.csv)',
  },
});

const FileUploadForm: FC<Props> = (props) => {
  const { open, onSubmit, onClose, formSubtitle } = props;
  const { t } = useTranslation();

  return (
    <FormDialog
      open={open}
      editing={false}
      onClose={onClose}
      onSubmit={onSubmit}
      title={t(translations.fileUpload)}
      formName="invite-users-file-upload-form"
      initialValues={initialValues}
      primaryActionText={t(translations.invite)}
    >
      {(control, formState): JSX.Element => (
        <>
          {formSubtitle}
          <Controller
            name="file"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormSingleFileInput
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                label={t(translations.fileUploadField)}
                accept={{ 'text/csv': [] }}
                previewComponent={FilePreview}
              />
            )}
          />
        </>
      )}
    </FormDialog>
  );
};

export default FileUploadForm;
