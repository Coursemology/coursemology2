import { FC } from 'react';
import { Controller } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import tableTranslations from 'lib/translations/table';
import {
  RoleRequestBasicListData,
  UserRoleRequestForm,
} from 'types/system/instance/roleRequests';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { saveInstanceRoleRequest } from 'bundles/course/courses/actions';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import useTranslation from 'lib/hooks/useTranslation';
import { createRoleRequest, updateRoleRequest } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
  instanceUserRoleRequest?: RoleRequestBasicListData;
}

const translations = defineMessages({
  newRoleRequest: {
    id: 'system.admin.instance.newRoleRequest',
    defaultMessage: 'New Role Request',
  },
  editRoleRequest: {
    id: 'system.admin.instance.editRoleRequest',
    defaultMessage: 'Edit Role Request',
  },
  instructor: {
    id: 'system.admin.instance.instructor',
    defaultMessage: 'Instructor (can create courses)',
  },
  administrator: {
    id: 'system.admin.instance.administrator',
    defaultMessage:
      'Administrator (can create courses and give other instructors permissions)',
  },
  submit: {
    id: 'system.admin.instance.submit',
    defaultMessage: 'Submit Request',
  },
  cancel: {
    id: 'system.admin.instance.cancel',
    defaultMessage: 'Cancel',
  },
  requestSuccess: {
    id: 'system.admin.instance.requestSucccess',
    defaultMessage: 'Request submitted successfully!',
  },
  requestFailed: {
    id: 'system.admin.instance.requestFailed',
    defaultMessage: 'Failed to submit request.',
  },
});

const InstanceUserRoleRequestForm: FC<Props> = (props) => {
  const { open, onClose, instanceUserRoleRequest } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

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

  const onSubmit = (data: UserRoleRequestForm, setError): void => {
    const handleOperations = instanceUserRoleRequest?.id
      ? (): Promise<{ id: number }> =>
          updateRoleRequest(data, instanceUserRoleRequest.id)
      : (): Promise<{ id: number }> => createRoleRequest(data);

    handleOperations()
      .then((response) => {
        toast.success(t(translations.requestSuccess));
        dispatch(saveInstanceRoleRequest({ ...response, ...data }));
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
      open={open}
      editing={!!instanceUserRoleRequest}
      onClose={onClose}
      onSubmit={onSubmit}
      title={
        instanceUserRoleRequest
          ? t(translations.editRoleRequest)
          : t(translations.newRoleRequest)
      }
      formName="instance-user-role-request-form"
      initialValues={initialValues}
    >
      {(control, formState): JSX.Element => (
        <div className="space-y-2">
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(tableTranslations.requestToBe)}
                options={[
                  {
                    value: 'instructor',
                    label: t(translations.instructor),
                  },
                  {
                    value: 'administrator',
                    label: t(translations.administrator),
                  },
                ]}
                type="string"
                margin="0"
                shrink
              />
            )}
          />

          <Controller
            name="organization"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                label={t(tableTranslations.organization)}
                disabled={formState.isSubmitting}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                variant="standard"
              />
            )}
          />

          <Controller
            name="designation"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                label={t(tableTranslations.designation)}
                disabled={formState.isSubmitting}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                variant="standard"
              />
            )}
          />

          <Controller
            name="reason"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                label={t(tableTranslations.reason)}
                disabled={formState.isSubmitting}
                fullWidth
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

export default InstanceUserRoleRequestForm;
