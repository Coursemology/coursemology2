import { FC, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  ExternalIdResolution,
  IndividualInvites,
  InvitationResult,
  InvitationsPostData,
  PendingExternalIdConflict,
} from 'types/course/userInvitations';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import formTranslations from 'lib/translations/form';

import useInviteErrorHandler from '../../hooks/useInviteErrorHandler';
import { inviteUsersFromForm } from '../../operations';
import {
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';
import ExternalIdConflictPrompt from '../misc/ExternalIdConflictPrompt';

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
  const handleError = useInviteErrorHandler(
    translations.failure,
    translations.failureGeneric,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [conflictData, setConflictData] =
    useState<PendingExternalIdConflict | null>(null);
  const dataRef = useRef<InvitationsPostData | null>(null);
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

  const submitWithResolution = (
    postData: InvitationsPostData,
    resolution?: ExternalIdResolution,
  ): Promise<void> =>
    dispatch(inviteUsersFromForm(postData, resolution))
      .then((response) => {
        if ('conflict' in response) {
          setConflictData(response.conflict);
        } else {
          reset(initialValues);
          openResultDialog(response as InvitationResult);
        }
      })
      .catch(handleError)
      .finally(() => setIsLoading(false));

  const onSubmit = (data: InvitationsPostData): Promise<void> => {
    setIsLoading(true);
    dataRef.current = data;
    return submitWithResolution(data);
  };

  const handleKeepExisting = (): void => {
    setConflictData(null);
    if (dataRef.current) {
      setIsLoading(true);
      submitWithResolution(dataRef.current, 'keep_existing');
    }
  };

  const handleReplaceAll = (): void => {
    setConflictData(null);
    if (dataRef.current) {
      setIsLoading(true);
      submitWithResolution(dataRef.current, 'replace_all');
    }
  };

  const handleCancel = (): void => {
    setConflictData(null);
    dataRef.current = null;
  };

  return (
    <>
      {conflictData && (
        <ExternalIdConflictPrompt
          onCancel={handleCancel}
          onKeepExisting={handleKeepExisting}
          onReplaceAll={handleReplaceAll}
          pendingCourseUserUpdates={conflictData.pendingCourseUserUpdates}
          pendingInvitationUpdates={conflictData.pendingInvitationUpdates}
        />
      )}
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
    </>
  );
};

export default IndividualInviteForm;
