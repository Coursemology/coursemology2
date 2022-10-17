import { FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ErrorText from 'lib/components/core/ErrorText';
import { LoadingButton } from '@mui/lab';
import {
  Grid,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
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
import { createRoleRequest, updateRoleRequest } from '../../operations';

interface Props extends WrappedComponentProps {
  handleClose: () => void;
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
  const { handleClose, instanceUserRoleRequest, intl } = props;
  const [isLoading, setIsLoading] = useState(false);
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

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserRoleRequestForm>({
    defaultValues: initialValues,
  });

  const onSubmit = (data: UserRoleRequestForm): void => {
    setIsLoading(true);
    const handleOperations = instanceUserRoleRequest?.id
      ? (): Promise<{ id: number }> =>
          updateRoleRequest(data, instanceUserRoleRequest.id)
      : (): Promise<{ id: number }> => createRoleRequest(data);

    handleOperations()
      .then((response) => {
        toast.success(intl.formatMessage(translations.requestSuccess));
        dispatch(saveInstanceRoleRequest({ ...response, ...data }));
        handleClose();
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error(intl.formatMessage(translations.requestFailed));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        throw error;
      });
  };

  const userRoleRequestForm = (
    <>
      <form
        encType="multipart/form-data"
        id="instance-user-role-request-form"
        noValidate
        onSubmit={handleSubmit((data: UserRoleRequestForm) => onSubmit(data))}
      >
        <ErrorText errors={errors} />
        <Stack spacing={2}>
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormSelectField
                field={field}
                fieldState={fieldState}
                disabled={isLoading}
                label={intl.formatMessage(tableTranslations.requestToBe)}
                options={[
                  {
                    value: 'instructor',
                    label: intl.formatMessage(translations.instructor),
                  },
                  {
                    value: 'administrator',
                    label: intl.formatMessage(translations.administrator),
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
                label={intl.formatMessage(tableTranslations.organization)}
                disabled={isLoading}
                // @ts-ignore: component is still written in JS
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
                label={intl.formatMessage(tableTranslations.designation)}
                disabled={isLoading}
                // @ts-ignore: component is still written in JS
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
                label={intl.formatMessage(tableTranslations.reason)}
                disabled={isLoading}
                // @ts-ignore: component is still written in JS
                fullWidth
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
          onClick={(): void => handleClose()}
          disabled={isLoading}
        >
          {intl.formatMessage(translations.cancel)}
        </Button>
        <LoadingButton
          loading={isLoading}
          disabled={isLoading || isSubmitting}
          variant="contained"
          className="btn-submit instance-user-role-request-form"
          form="instance-user-role-request-form"
          type="submit"
        >
          {intl.formatMessage(translations.submit)}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <Dialog
      onClose={handleClose}
      open
      fullWidth
      maxWidth="md"
      style={{
        top: 40,
      }}
    >
      <DialogTitle>
        {instanceUserRoleRequest
          ? intl.formatMessage(translations.editRoleRequest)
          : intl.formatMessage(translations.newRoleRequest)}
      </DialogTitle>
      <DialogContent>{userRoleRequestForm}</DialogContent>
    </Dialog>
  );
};

export default injectIntl(InstanceUserRoleRequestForm);
