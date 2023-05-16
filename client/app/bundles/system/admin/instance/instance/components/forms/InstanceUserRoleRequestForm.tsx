import { FC } from 'react';
import { Controller } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import {
  RoleRequestBasicListData,
  UserRoleRequestForm,
} from 'types/system/instance/roleRequests';

import { actions } from 'bundles/course/courses/store';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormTextField from 'lib/components/form/fields/TextField';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import { createRoleRequest, updateRoleRequest } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
  instanceUserRoleRequest?: RoleRequestBasicListData;
}

const translations = defineMessages({
  newRoleRequest: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestForm.newRoleRequest',
    defaultMessage: 'New Role Request',
  },
  editRoleRequest: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestForm.editRoleRequest',
    defaultMessage: 'Edit Role Request',
  },
  submit: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestForm.submit',
    defaultMessage: 'Submit Request',
  },
  cancel: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestForm.cancel',
    defaultMessage: 'Cancel',
  },
  requestSuccess: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestForm.requestSucccess',
    defaultMessage: 'Request submitted successfully!',
  },
  requestFailed: {
    id: 'system.admin.instance.instance.InstanceUserRoleRequestForm.requestFailed',
    defaultMessage: 'Failed to submit request.',
  },
});

const InstanceUserRoleRequestForm: FC<Props> = (props) => {
  const { open, onClose, instanceUserRoleRequest } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  let initialValues = { ...instanceUserRoleRequest };
  if (!instanceUserRoleRequest) {
    initialValues = {
      id: undefined,
      role: 'instructor',
      organization: '',
      designation: '',
      reason: '',
    };
  }

  const onSubmit = (data: UserRoleRequestForm, setError): Promise<void> => {
    const handleOperations = instanceUserRoleRequest?.id
      ? (): Promise<{ id: number }> =>
          updateRoleRequest(data, instanceUserRoleRequest.id)
      : (): Promise<{ id: number }> => createRoleRequest(data);

    return handleOperations()
      .then((response) => {
        toast.success(t(translations.requestSuccess));
        dispatch(actions.saveInstanceRoleRequest({ ...data, ...response }));
        onClose();
      })
      .catch((error) => {
        toast.error(t(translations.requestFailed));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };

  return (
    <FormDialog
      editing={!!instanceUserRoleRequest}
      formName="instance-user-role-request-form"
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={
        instanceUserRoleRequest
          ? t(translations.editRoleRequest)
          : t(translations.newRoleRequest)
      }
    >
      {(control, formState): JSX.Element => (
        <div className="space-y-2">
          <Controller
            control={control}
            name="role"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(tableTranslations.requestToBe)}
                variant="standard"
              />
            )}
          />

          <Controller
            control={control}
            name="organization"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(tableTranslations.organization)}
                variant="standard"
              />
            )}
          />

          <Controller
            control={control}
            name="designation"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(tableTranslations.designation)}
                variant="standard"
              />
            )}
          />

          <Controller
            control={control}
            name="reason"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(tableTranslations.reason)}
                variant="standard"
              />
            )}
          />
        </div>
      )}
    </FormDialog>
  );
};

export default InstanceUserRoleRequestForm;
