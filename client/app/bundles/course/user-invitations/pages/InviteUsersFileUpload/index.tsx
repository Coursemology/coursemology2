import { FC, ReactNode, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DownloadIcon from '@mui/icons-material/Download';
import { Link, Typography } from '@mui/material';
import { InvitationResult } from 'types/course/userInvitations';
import { AppDispatch, AppState } from 'types/store';

import CourseAPI from 'api/course';
import useTranslation from 'lib/hooks/useTranslation';

import FileUploadForm from '../../components/forms/InviteUsersFileUploadForm';
import { inviteUsersFromFile } from '../../operations';
import {
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';

interface Props {
  open: boolean;
  openResultDialog: (invitationResult: InvitationResult) => void;
  onClose: () => void;
}

const translations = defineMessages({
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
  failure: {
    id: 'course.userInvitation.registrationCode.failure',
    defaultMessage:
      'Failed to invite users. Please ensure your data is formatted correctly - {error}',
  },
});

const InviteUsersFileUpload: FC<Props> = (props) => {
  const { open, onClose, openResultDialog } = props;
  const { t } = useTranslation();
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

  const onSubmit = (data): Promise<void> => {
    return dispatch(inviteUsersFromFile(data.file))
      .then((response) => {
        onClose();
        openResultDialog(response);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.failure, {
            error: errorMessage,
          }),
          { autoClose: false },
        );
      });
  };

  const formSubtitle = (
    <>
      <Typography variant="body2">{t(translations.fileUploadInfo)}</Typography>
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
        <strong>{t(translations.exampleHeader)}</strong>
        <Link
          download="template.csv"
          href={downloadTemplatePath}
          style={{ textDecoration: 'none', cursor: 'pointer' }}
          target="_blank"
          variant="inherit"
        >
          {t(translations.template)}
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
            __html: t(translations.fileUploadExamplePersonalTimeline),
          }}
        />
      ) : (
        <pre
          dangerouslySetInnerHTML={{
            __html: t(translations.fileUploadExample),
          }}
        />
      )}
    </>
  );

  return (
    <FileUploadForm
      formSubtitle={formSubtitle}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
    />
  );
};

export default InviteUsersFileUpload;
