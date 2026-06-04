import { FC, ReactNode, useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DownloadIcon from '@mui/icons-material/Download';
import { Typography } from '@mui/material';
import {
  InvitationFileEntity,
  InvitationResult,
  PendingExternalIdConflict,
} from 'types/course/userInvitations';

import { getCourseUserInviteTemplatePath } from 'course/helper';
import Link from 'lib/components/core/Link';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import FileUploadForm from '../../components/forms/InviteUsersFileUploadForm';
import ExternalIdConflictPrompt from '../../components/misc/ExternalIdConflictPrompt';
import useInviteErrorHandler from '../../hooks/useInviteErrorHandler';
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
  fileUploadInfoEmail: {
    id: 'course.userInvitations.InviteUsersFileUpload.fileUploadInfoEmail',
    defaultMessage:
      'Each invitation must use a unique email address within the course. Duplicate emails will be skipped.',
  },
  fileUploadInfoExternalId: {
    id: 'course.userInvitations.InviteUsersFileUpload.fileUploadInfoExternalId',
    defaultMessage:
      'External ID is optional. If provided, it overwrites any existing external ID for the user and must be unique within the course.',
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
      'Name,Email,External ID,Role,Phantom' +
      '{br}John,test1@example.com,A0123456,student,y' +
      '{br}Mary,test2@example.com,A0123457,teaching_assistant,n',
  },
  fileUploadExamplePersonalTimeline: {
    id: 'course.userInvitations.InviteUsersFileUpload.fileUploadExamplePersonalTimeline',
    defaultMessage:
      'Name,Email,External ID,Role,Phantom,Personal Timeline' +
      '{br}John,test1@example.com,A0123456,student,y,otot' +
      '{br}Mary,test2@example.com,A0123457,teaching_assistant,n,fixed',
  },
  failure: {
    id: 'course.userInvitations.InviteUsersFileUpload.failure',
    defaultMessage:
      'Failed to invite users. Please ensure your data is formatted correctly - {error}',
  },
  failureGeneric: {
    id: 'course.userInvitations.InviteUsersFileUpload.failureGeneric',
    defaultMessage:
      'Failed to invite users. Please ensure your data is formatted correctly.',
  },
});

const InviteUsersFileUpload: FC<Props> = (props) => {
  const { open, onClose, openResultDialog } = props;
  const { t } = useTranslation();
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const fileRef = useRef<InvitationFileEntity | null>(null);
  const [conflictData, setConflictData] =
    useState<PendingExternalIdConflict | null>(null);

  const sharedData = useAppSelector(getManageCourseUsersSharedData);
  const permissions = useAppSelector(getManageCourseUserPermissions);

  const defaultTimelineAlgorithm = sharedData.defaultTimelineAlgorithm;
  const handleError = useInviteErrorHandler(
    translations.failure,
    translations.failureGeneric,
  );

  if (!open && !conflictData) {
    return null;
  }

  const submitWithResolution = (
    fileEntity: InvitationFileEntity,
    resolution?: 'keep_existing' | 'replace_all',
  ): Promise<void> =>
    dispatch(inviteUsersFromFile(fileEntity, resolution))
      .then((response) => {
        if ('conflict' in response) {
          setConflictData(response.conflict);
        } else {
          onClose();
          openResultDialog(response as InvitationResult);
        }
      })
      .catch(handleError);

  const onSubmit = (data: { file: InvitationFileEntity }): Promise<void> => {
    fileRef.current = data.file;
    return submitWithResolution(data.file);
  };

  const handleKeepExisting = (): void => {
    setConflictData(null);
    if (fileRef.current) submitWithResolution(fileRef.current, 'keep_existing');
  };

  const handleReplaceAll = (): void => {
    setConflictData(null);
    if (fileRef.current) submitWithResolution(fileRef.current, 'replace_all');
  };

  const handleCancel = (): void => {
    setConflictData(null);
    fileRef.current = null;
  };

  const formSubtitle = (
    <>
      <Typography variant="body2">{t(translations.fileUploadInfo)}</Typography>
      <ul>
        <li>
          <Typography variant="body2">
            {t(translations.fileUploadInfoEmail)}
          </Typography>
        </li>
        <li>
          <Typography variant="body2">
            <FormattedMessage {...translations.fileUploadInfoExternalId} />
          </Typography>
        </li>
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
          href={getCourseUserInviteTemplatePath(
            permissions.canManagePersonalTimes,
            intl.locale,
          )}
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
        <pre>{t(translations.fileUploadExample, { br: '\n' })}</pre>
      )}
    </>
  );

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
      <FileUploadForm
        formSubtitle={formSubtitle}
        onClose={onClose}
        onSubmit={onSubmit}
        open={open && !conflictData}
      />
    </>
  );
};

export default InviteUsersFileUpload;
