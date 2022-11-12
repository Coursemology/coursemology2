import { FC, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  IndividualInvites,
  InvitationResult,
  InvitationsPostData,
} from 'types/course/userInvitations';
import { AppDispatch, AppState } from 'types/store';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import formTranslations from 'lib/translations/form';
import messagesTranslations from 'lib/translations/messages';

import { inviteUsersFromForm } from '../../operations';
import {
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

import IndividualInvitations from './IndividualInvitations';

interface Props extends WrappedComponentProps {
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
  const { openResultDialog, intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );
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
    formState,
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

  // It's recommended to reset in useEffect as execution order matters
  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset(initialValues);
    }
  }, [formState, reset]);

  const onSubmit = (data: InvitationsPostData): Promise<void> => {
    setIsLoading(true);
    return dispatch(inviteUsersFromForm(data))
      .then((response) => {
        openResultDialog(response);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(messagesTranslations.formUpdateError));
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form
      encType="multipart/form-data"
      id="invite-users-individual-form"
      noValidate={true}
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

export default injectIntl(IndividualInviteForm);
