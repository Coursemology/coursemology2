import { FC } from 'react';
import { Controller } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { TextField } from '@mui/material';
import { AppDispatch } from 'types/store';
import { RoleRequestRowData } from 'types/system/instance/roleRequests';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

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
      editing={false}
      formName="reject-with-message-form"
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={t(translations.header)}
    >
      {(control, formState): JSX.Element => (
        <div className="space-y-2">
          <TextField
            defaultValue={roleRequest.name}
            disabled
            fullWidth
            label={t(tableTranslations.name)}
            required
            variant="standard"
          />
          <TextField
            defaultValue={roleRequest.email}
            disabled
            fullWidth
            label={t(tableTranslations.email)}
            required
            variant="standard"
          />
          <TextField
            defaultValue={roleRequest.role}
            disabled
            fullWidth
            label={t(tableTranslations.requestToBe)}
            required
            variant="standard"
          />
          <TextField
            defaultValue={roleRequest.organization}
            disabled
            fullWidth
            label={t(tableTranslations.organization)}
            variant="standard"
          />
          <TextField
            defaultValue={roleRequest.designation}
            disabled
            fullWidth
            label={t(tableTranslations.designation)}
            variant="standard"
          />
          <TextField
            defaultValue={roleRequest.reason}
            disabled
            fullWidth
            label={t(tableTranslations.reason)}
            variant="standard"
          />
          <Controller
            control={control}
            name="rejectionMessage"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                className="rejectionMessage"
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(tableTranslations.rejectionMessage)}
                multiline
                rows={2}
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
