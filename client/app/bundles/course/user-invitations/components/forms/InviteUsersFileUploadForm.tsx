import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { InvitationFileEntity } from 'types/course/userInvitations';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormSingleFileInput, {
  FilePreview,
} from 'lib/components/form/fields/SingleFileInput';
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
      editing={false}
      formName="invite-users-file-upload-form"
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      primaryActionText={t(translations.invite)}
      title={t(translations.fileUpload)}
    >
      {(control, formState): JSX.Element => (
        <>
          {formSubtitle}
          <Controller
            control={control}
            name="file"
            render={({ field, fieldState }): JSX.Element => (
              <FormSingleFileInput
                accept={{ 'text/csv': [] }}
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                label={t(translations.fileUploadField)}
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
