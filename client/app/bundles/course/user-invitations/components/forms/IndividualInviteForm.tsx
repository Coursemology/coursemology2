import ErrorText from 'lib/components/ErrorText';
import { FC, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { ManageCourseUsersPermissions } from 'types/course/courseUsers';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import {
  IndividualInvites,
  InvitationsPostData,
} from 'types/course/userInvitations';
import IndividualInvitations from './IndividualInvitations';
import { inviteUsersFromForm } from '../../operations';

interface Props extends WrappedComponentProps {
  permissions: ManageCourseUsersPermissions;
}

const translations = defineMessages({
  required: {
    id: 'course.userInvitations.IndividualInvitations.error.required',
    defaultMessage: 'Required',
  },
  emailFormat: {
    id: 'course.userInvitations.IndividualInvitations.error.emailFormat',
    defaultMessage: 'Enter a valid email format',
  },
});

const validationSchema = yup.object({
  invitations: yup.array().of(
    yup.object({
      name: yup.string().required(translations.required),
      email: yup
        .string()
        .email(translations.emailFormat)
        .required(translations.required),
      phantom: yup.bool(),
      role: yup.string(),
      timelineAlgorithm: yup.string(),
    }),
  ),
});

const IndividualInviteForm: FC<Props> = (props) => {
  const { permissions } = props;
  const dispatch = useDispatch<AppDispatch>();
  const initialValues = {
    invitations: [
      {
        name: '',
        email: '',
        role: 'student',
        phantom: false,
        ...(permissions.canManagePersonalTimes && {
          timelineAlgorithm: 'fixed',
        }),
      },
    ],
  };
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<IndividualInvites>({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
  });
  const {
    fields: invitationsFields,
    append: invitationsAppend,
    remove: invitationsRemove,
  } = useFieldArray({
    control,
    name: 'invitations',
  });

  const invitations = watch('invitations');

  // When the values in any of the array invitations fields are changed,
  // 'fields' from useFieldArray are not updated but the internal values of options
  // are already updated in useForm. We then use watch to extract the updated options values
  // and update those to controlledFields as seen below.
  const controlledInvitationsFields = invitationsFields.map((field, index) => ({
    ...field,
    ...invitations[index],
  }));

  useEffect(() => {
    // To add an invitation field by default when all other invitation fields are deleted.
    if (invitationsFields.length === 0) {
      invitationsAppend({
        name: '',
        email: '',
        role: 'student',
        phantom: false,
        ...(permissions.canManagePersonalTimes && {
          timelineAlgorithm: 'fixed',
        }),
      });
    }
  }, [invitationsFields.length === 0]);

  const onSubmit = (data: InvitationsPostData): Promise<void> => {
    return dispatch(inviteUsersFromForm(data))
      .then((response) => {
        const { success, warning } = response;
        if (success) toast.success(success);
        if (warning) toast.warn(warning);
      })
      .finally(() => {
        reset(initialValues);
      });
  };

  return (
    <form
      encType="multipart/form-data"
      id="invite-users-individual-form"
      noValidate
      onSubmit={handleSubmit((data) => onSubmit(data))}
    >
      <ErrorText errors={errors} />
      <IndividualInvitations
        permissions={permissions}
        fieldsConfig={{
          control,
          fields: controlledInvitationsFields,
          append: invitationsAppend,
          remove: invitationsRemove,
        }}
      />
    </form>
  );
};

export default injectIntl(IndividualInviteForm);
