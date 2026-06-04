import { FC, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  IndividualInvites,
  InvitationResult,
  InvitationsPostData,
} from 'types/course/userInvitations';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { inviteUsersFromForm } from '../../operations';
import {
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

import IndividualInvitations from './IndividualInvitations';

const translations = defineMessages({
  failure: {
    id: 'course.userInvitations.IndividualInviteForm.failure',
    defaultMessage: 'Failed to invite users. {error}',
  },
  failureGeneric: {
    id: 'course.userInvitations.IndividualInviteForm.failureGeneric',
    defaultMessage: 'Failed to invite users. You may reload and try again.',
  },
});

interface Props {
  openResultDialog: (invitationResult: InvitationResult) => void;
}

const validationSchema = yup.object({
  invitations: yup.array().of(
    yup.object({
      name: yup
        .string()
        .required(formTranslations.required)
        .max(254, formTranslations.characters),
      email: yup
        .string()
        .email(formTranslations.email)
        .required(formTranslations.required),
      phantom: yup.bool(),
      role: yup.string(),
      timelineAlgorithm: yup.string(),
    }),
  ),
});

const IndividualInviteForm: FC<Props> = (props) => {
  const { openResultDialog } = props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const sharedData = useAppSelector(getManageCourseUsersSharedData);
  const permissions = useAppSelector(getManageCourseUserPermissions);
  const defaultTimelineAlgorithm = sharedData.defaultTimelineAlgorithm;
  const emptyInvitation = {
    name: '',
    email: '',
    role: 'student',
    phantom: false,
    ...(permissions.canManagePersonalTimes && {
      timelineAlgorithm: defaultTimelineAlgorithm,
    }),
  };
  const initialValues = {
    invitations: [emptyInvitation],
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
      invitationsAppend(emptyInvitation);
    }
  }, [invitationsFields.length === 0]);

  const handleError = (error: unknown): void => {
    const rawErrors = (error as { response?: { data?: { errors?: unknown } } })
      ?.response?.data?.errors;
    let errorList: string[];
    if (Array.isArray(rawErrors)) errorList = rawErrors;
    else if (typeof rawErrors === 'string') errorList = [rawErrors];
    else errorList = [];
    const first = errorList[0];
    const overflow =
      errorList.length > 1 ? ` (and ${errorList.length - 1} more)` : '';
    if (first) {
      toast.error(t(translations.failure, { error: first + overflow }), {
        autoClose: false,
      });
    } else {
      toast.error(t(translations.failureGeneric), { autoClose: false });
    }
  };

  const onSubmit = (data: InvitationsPostData): Promise<void> => {
    setIsLoading(true);
    return dispatch(inviteUsersFromForm(data))
      .then((result) => {
        reset(initialValues);
        openResultDialog(result);
      })
      .catch(handleError)
      .finally(() => setIsLoading(false));
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
        fieldsConfig={{
          control,
          fields: controlledInvitationsFields,
          append: invitationsAppend,
          remove: invitationsRemove,
        }}
        isLoading={isLoading}
        permissions={permissions}
      />
    </form>
  );
};

export default IndividualInviteForm;
