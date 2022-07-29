import { FC, ReactNode, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Typography,
} from '@mui/material';

import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import {
  InvitationFileEntity,
  InvitationResult,
} from 'types/course/userInvitations';
import DownloadIcon from '@mui/icons-material/Download';
import CourseAPI from 'api/course';
import FileUploadForm from '../../components/forms/InviteUsersFileUploadForm';
import {
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';
import { inviteUsersFromFile } from '../../operations';

interface Props extends WrappedComponentProps {
  open: boolean;
  openResultDialog: (invitationResult: InvitationResult) => void;
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
    values: {
      code: (str: ReactNode[]): JSX.Element => <code>{str}</code>,
    },
  },
  fileUploadInfoPhantom: {
    id: 'course.userInvitation.fileUpload.info.phantom',
    defaultMessage: `Phantom can be true/false with the following true values <code>['t', 'true', 'y', 'yes']</code>\
     (case insenstitive), and defaults to false if omitted.`,
    values: {
      code: (str: ReactNode[]): JSX.Element => <code>{str}</code>,
    },
  },
  fileUploadInfoPersonalTimeline: {
    id: 'course.userInvitation.fileUpload.info.personalTimeline',
    defaultMessage:
      `Personal Timelines can be <code>[fixed, otot, stragglers, fomo]</code>, ` +
      `with course default: {defaultTimelineAlgorithm} if omitted.`,
  },
  exampleHeader: {
    id: 'course.userInvitation.fileUpload.example.header',
    defaultMessage: 'Example ',
  },
  template: {
    id: 'course.userInvitation.fileUpload.example.template',
    defaultMessage: '(Template File)',
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
      'Failed to invite users. Please ensure your data is formatted correctly - {error}',
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
  const { open, handleClose, openResultDialog, intl } = props;
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [downloadTemplatePath, setDownloadTemplatePath] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  const sharedData = useSelector((state: AppState) =>
    getManageCourseUsersSharedData(state),
  );
  const permissions = useSelector((state: AppState) =>
    getManageCourseUserPermissions(state),
  );

  const defaultTimelineAlgorithm = sharedData.defaultTimelineAlgorithm;

  useEffect(() => {
    CourseAPI.userInvitations.getTemplateCsvPath().then((response) => {
      setDownloadTemplatePath(response.data.templatePath);
    });
  }, []);

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

  const onSubmit = (data: InvitationFileEntity): Promise<void> => {
    setIsLoading(true);
    return dispatch(inviteUsersFromFile(data))
      .then((response) => {
        handleClose();
        openResultDialog(response);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.failure, {
            error: errorMessage,
          }),
          { autoClose: false },
        );
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
          <Typography variant="body2">
            <FormattedMessage {...translations.fileUploadInfoRole} />
          </Typography>
        </li>
        <li>
          <Typography variant="body2">
            <FormattedMessage {...translations.fileUploadInfoPhantom} />
          </Typography>
        </li>
        {permissions.canManagePersonalTimes && (
          <li>
            <Typography variant="body2">
              <FormattedMessage
                {...translations.fileUploadInfoPersonalTimeline}
                values={{
                  code: (str: ReactNode[]): JSX.Element => <code>{str}</code>,
                  defaultTimelineAlgorithm: `${defaultTimelineAlgorithm}`,
                }}
              />
            </Typography>
          </li>
        )}
      </ul>
      <Typography variant="body2">
        <strong>{intl.formatMessage(translations.exampleHeader)}</strong>
        <Link
          variant="inherit"
          href={downloadTemplatePath}
          download="template.csv"
          target="_blank"
          style={{ textDecoration: 'none', cursor: 'pointer' }}
        >
          {intl.formatMessage(translations.template)}
          <DownloadIcon
            fontSize="small"
            style={{
              verticalAlign: 'bottom',
            }}
          />
        </Link>
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
          top: 0,
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
