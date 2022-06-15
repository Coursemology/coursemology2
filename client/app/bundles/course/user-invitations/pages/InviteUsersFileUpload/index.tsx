import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';

import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { InvitationFileEntity } from 'types/course/userInvitations';
import { inviteUsersFromFile } from '../../operations';
import FileUploadForm from '../../components/forms/InviteUsersFileUploadForm';
import {
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

interface Props extends WrappedComponentProps {
  open: boolean;
  handleClose: () => void;
}

const translations = defineMessages({
  fileUpload: {
    id: 'course.userInvitation.fileUpload',
    defaultMessage: 'File Upload',
  },
  fileUploadInfo: {
    id: 'course.userInvitation.fileUpload.info',
    defaultMessage: 'Upload a .csv file with the following format:',
  },
  fileUploadInfoRole: {
    id: 'course.userInvitation.fileUpload.info.role',
    defaultMessage:
      'Roles can be <code>[student, observer, teaching_assistant, manager, owner]</code>,\
     and defaults to student if omitted. Teaching assistants can only invite users as students.',
  },
  fileUploadInfoPhantom: {
    id: 'course.userInvitation.fileUpload.info.phantom',
    defaultMessage: `Phantom can be true/false with the following true values <code>['t', 'true', 'y', 'yes']</code>\
     (case insenstitive), and defaults to false if omitted.`,
  },
  fileUploadInfoPersonalTimeline: {
    id: 'course.userInvitation.fileUpload.info.personalTimeline',
    defaultMessage:
      `Personal Timelines can be [fixed, otot, stragglers, fomo], ` +
      `with course default: {defaultTimelineAlgorithm} if omitted.`,
  },
  exampleHeader: {
    id: 'course.userInvitation.fileUpload.example.header',
    defaultMessage: 'Example:',
  },
  fileUploadExample: {
    id: 'course.userInvitation.fileUpload.example',
    defaultMessage:
      'Name,Email[,Role,Phantom]' +
      '\nJohn,test1@example.org[,student,y]' +
      '\nMary,test2@example.org[,teaching_assistant,n]',
  },
  fileUploadExamplePersonalTimeline: {
    id: 'course.userInvitation.fileUpload.examplePersonalTimeline',
    defaultMessage:
      'Name,Email[,Role,Phantom,PersonalTimeline]' +
      '\nJohn,test1@example.org[,student,y,otot]' +
      '\nMary,test2@example.org[,teaching_assistant,n,fixed]',
  },
  invite: {
    id: 'course.userInvitation.registrationCode.invite',
    defaultMessage: 'Invite Users from File',
  },
  failure: {
    id: 'course.userInvitation.registrationCode.failure',
    defaultMessage:
      'Failed to invite users. Please ensure your data is formatted correctly. {error}',
  },
  cancel: {
    id: 'course.userInvitation.registrationCode.cancel',
    defaultMessage: 'Cancel',
  },
});

const initialValues = {
  file: { name: '', url: '', file: undefined },
};

const InviteUsersFileUpload: FC<Props> = (props) => {
  const { open, handleClose, intl } = props;
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );

  const defaultTimelineAlgorithm = sharedData.defaultTimelineAlgorithm;

  if (!open) {
    return null;
  }

  const confirmIfDirty = (): void => {
    if (isDirty) {
      setDiscardDialogOpen(true);
    } else {
      handleClose();
    }
  };

  const onSubmit = (data: InvitationFileEntity, setError): Promise<void> => {
    setIsLoading(true);
    return dispatch(inviteUsersFromFile(data))
      .then((response) => {
        const { success, warning } = response;
        if (success) toast.success(success);
        if (warning) toast.warn(warning);
        setTimeout(() => {
          handleClose();
        }, 600);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.failure));
        if (error.response?.data) {
          toast.error(
            intl.formatMessage(translations.failure, {
              error: error.response.data.errors,
            }),
          );
          setReactHookFormError(setError, error.response.data.errors);
        }
        throw error;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const renderHelperText = (
    <>
      <Typography variant="body2">
        {intl.formatMessage(translations.fileUploadInfo)}
      </Typography>
      <ul>
        <li>
          <Typography
            variant="body2"
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage(translations.fileUploadInfoRole),
            }}
          />
        </li>
        <li>
          <Typography
            variant="body2"
            dangerouslySetInnerHTML={{
              __html: intl.formatMessage(translations.fileUploadInfoPhantom),
            }}
          />
        </li>
        {permissions.canManagePersonalTimes && (
          <li>
            <Typography
              variant="body2"
              dangerouslySetInnerHTML={{
                __html: intl.formatMessage(
                  translations.fileUploadInfoPersonalTimeline,
                  { defaultTimelineAlgorithm },
                ),
              }}
            />
          </li>
        )}
      </ul>
      <Typography variant="body2">
        <strong>{intl.formatMessage(translations.exampleHeader)}</strong>
      </Typography>
      {permissions.canManagePersonalTimes ? (
        <pre
          dangerouslySetInnerHTML={{
            __html: intl.formatMessage(
              translations.fileUploadExamplePersonalTimeline,
            ),
          }}
        />
      ) : (
        <pre
          dangerouslySetInnerHTML={{
            __html: intl.formatMessage(translations.fileUploadExample),
          }}
        />
      )}
    </>
  );

  return (
    <>
      <Dialog
        onClose={confirmIfDirty}
        open={open}
        fullWidth
        maxWidth="lg"
        style={{
          position: 'absolute',
          top: 50,
        }}
      >
        <DialogTitle>
          {`${intl.formatMessage(translations.fileUpload)}`}
        </DialogTitle>
        <DialogContent>
          {renderHelperText}
          <FileUploadForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            setIsDirty={setIsDirty}
            handleClose={confirmIfDirty}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        confirmDiscard
        open={discardDialogOpen}
        onCancel={(): void => setDiscardDialogOpen(false)}
        onConfirm={(): void => {
          setDiscardDialogOpen(false);
          handleClose();
        }}
      />
    </>
  );
};

export default injectIntl(InviteUsersFileUpload);
