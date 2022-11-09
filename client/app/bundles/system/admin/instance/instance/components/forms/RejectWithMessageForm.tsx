import { FC } from 'react';
import { Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { TextField } from '@mui/material';
import { defineMessages } from 'react-intl';
import FormTextField from 'lib/components/form/fields/TextField';
import tableTranslations from 'lib/translations/table';
import { RoleRequestRowData } from 'types/system/instance/roleRequests';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import useTranslation from 'lib/hooks/useTranslation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { rejectRoleRequest } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
  roleRequest: RoleRequestRowData;
}

const translations = defineMessages({
  header: {
    id: 'roleRequests.header',
    defaultMessage: 'Role Request Rejection',
  },
  rejectSuccess: {
    id: 'roleRequests.reject.success',
    defaultMessage: 'The role request made by {name} has been rejected.',
  },
  rejectFailure: {
    id: 'roleRequests.reject.fail',
    defaultMessage: 'Failed to reject role request - {error}',
  },
});

const initialValues = {
  rejectionMessage: '',
};

const RejectWithMessageForm: FC<Props> = (props) => {
  const { open, onClose, roleRequest } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = (data): Promise<void> => {
    return dispatch(rejectRoleRequest(roleRequest.id, data.rejectionMessage))
      .then(() => {
        toast.success(
          t(translations.rejectSuccess, {
            name: roleRequest.name,
          }),
        );
        onClose();
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.rejectFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  return (
    <FormDialog
      open={open}
      editing={false}
      onClose={onClose}
      onSubmit={onSubmit}
      title={t(translations.header)}
      formName="reject-with-message-form"
      initialValues={initialValues}
    >
      {(control, formState): JSX.Element => (
        <div className="space-y-2">
          <TextField
            disabled
            required
            fullWidth
            label={t(tableTranslations.name)}
            defaultValue={roleRequest.name}
            variant="standard"
          />
          <TextField
            disabled
            required
            fullWidth
            label={t(tableTranslations.email)}
            defaultValue={roleRequest.email}
            variant="standard"
          />
          <TextField
            disabled
            required
            fullWidth
            label={t(tableTranslations.requestToBe)}
            defaultValue={roleRequest.role}
            variant="standard"
          />
          <TextField
            disabled
            fullWidth
            label={t(tableTranslations.organization)}
            defaultValue={roleRequest.organization}
            variant="standard"
          />
          <TextField
            disabled
            fullWidth
            label={t(tableTranslations.designation)}
            defaultValue={roleRequest.designation}
            variant="standard"
          />
          <TextField
            disabled
            fullWidth
            label={t(tableTranslations.reason)}
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
                disabled={formState.isSubmitting}
                label={t(tableTranslations.rejectionMessage)}
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
        </div>
      )}
    </FormDialog>
  );
};

export default RejectWithMessageForm;
