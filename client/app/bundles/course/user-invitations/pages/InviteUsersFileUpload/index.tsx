import { FC, ReactNode } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import DownloadIcon from '@mui/icons-material/Download';
import { Typography } from '@mui/material';
import { InvitationResult } from 'types/course/userInvitations';

import { getCourseUserInviteTemplatePath } from 'course/helper';
import Link from 'lib/components/core/Link';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
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
    id: 'course.userInvitations.InviteUsersFileUpload.fileUploadInfo',
    defaultMessage: 'Upload a .csv file with the following format:',
  },
  fileUploadInfoRole: {
    id: 'course.userInvitations.InviteUsersFileUpload.fileUploadInfoRole',
    defaultMessage:
      'Roles can be <code>[student, observer, teaching_assistant, manager, owner]</code>,\
     and defaults to student if omitted. Teaching assistants can only invite users as students.',
    values: {
      code: (str: ReactNode[]): JSX.Element => <code>{str}</code>,
    },
  },
  fileUploadInfoPhantom: {
    id: 'course.userInvitations.InviteUsersFileUpload.fileUploadInfoPhantom',
    defaultMessage:
      "Phantom can be true/false with the following true values <code>['t', 'true', 'y', 'yes']</code>\
     (case insenstitive), and defaults to false if omitted.",
    values: {
      code: (str: ReactNode[]): JSX.Element => <code>{str}</code>,
    },
  },
  fileUploadInfoPersonalTimeline: {
    id: 'course.userInvitations.InviteUsersFileUpload.fileUploadInfoPersonalTimeline',
    defaultMessage:
      'Personal Timelines can be <code>[fixed, otot, stragglers, fomo]</code>,\
      with course default: {defaultTimelineAlgorithm} if omitted.',
  },
  exampleHeader: {
    id: 'course.userInvitations.InviteUsersFileUpload.exampleHeader',
    defaultMessage: 'Example ',
  },
  template: {
    id: 'course.userInvitations.InviteUsersFileUpload.template',
    defaultMessage: '(Template File)',
  },
  fileUploadExample: {
    id: 'course.userInvitations.InviteUsersFileUpload.fileUploadExample',
    defaultMessage:
      'Name,Email[,Role,Phantom]' +
      '{br}John,test1@example.org[,student,y]' +
      '{br}Mary,test2@example.org[,teaching_assistant,n]',
  },
  fileUploadExamplePersonalTimeline: {
    id: 'course.userInvitations.InviteUsersFileUpload.fileUploadExamplePersonalTimeline',
    defaultMessage:
      'Name,Email[,Role,Phantom,PersonalTimeline]' +
      '{br}John,test1@example.org[,student,y,otot]' +
      '{br}Mary,test2@example.org[,teaching_assistant,n,fixed]',
  },
  failure: {
    id: 'course.userInvitations.InviteUsersFileUpload.failure',
    defaultMessage:
      'Failed to invite users. Please ensure your data is formatted correctly - {error}',
  },
});

const InviteUsersFileUpload: FC<Props> = (props) => {
  const { open, onClose, openResultDialog } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const sharedData = useAppSelector(getManageCourseUsersSharedData);
  const permissions = useAppSelector(getManageCourseUserPermissions);

  const defaultTimelineAlgorithm = sharedData.defaultTimelineAlgorithm;

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
          href={getCourseUserInviteTemplatePath()}
          opensInNewTab
          style={{ textDecoration: 'none', cursor: 'pointer' }}
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
        <pre>
          {t(translations.fileUploadExamplePersonalTimeline, { br: '\n' })}
        </pre>
      ) : (
        <pre>
          {t(translations.fileUploadExample, { br: '\n' })}
        </pre>
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
