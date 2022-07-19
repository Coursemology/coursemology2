import { FC, forwardRef } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  defineMessages,
  injectIntl,
  IntlShape,
  WrappedComponentProps,
} from 'react-intl';
import {
  InvitationListData,
  InvitationResult,
} from 'types/course/userInvitations';
import HelpIcon from '@mui/icons-material/Help';
import sharedConstants from 'lib/constants/sharedConstants';
import { CourseUserData } from 'types/course/courseUsers';
import tableTranslations from 'lib/components/tables/translations';
import { TableVirtuoso } from 'react-virtuoso';

interface Props extends WrappedComponentProps {
  open: boolean;
  handleClose: () => void;
  invitationResult: InvitationResult;
}

const styles = {
  icon: {
    fontSize: '16px',
    marginRight: '4px',
  },
};

const translations = defineMessages({
  header: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.header',
    defaultMessage: 'Invitation Summary',
  },
  close: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.close',
    defaultMessage: 'Close',
  },
  body: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.body',
    defaultMessage:
      '{count, plural, =0 {No new users were} one {# new user was} other {# new users were}} invited.',
  },
  duplicateInfo: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.duplicateUsers.info',
    defaultMessage:
      'Duplicate users were found in the invitation. Only the first instance of this user will be invited.',
  },
  duplicateUsers: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.duplicateUsers',
    defaultMessage: 'Users with Duplicate Emails ({count})',
  },
  existingCourseUsersInfo: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.existingCourseUsers.info',
    defaultMessage:
      'Existing course users with this email were found in the invitation. They were not invited.',
  },
  existingCourseUsers: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.existingCourseUsers',
    defaultMessage: 'Existing Course Users ({count})',
  },
  existingInvitationsInfo: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.existingInvitations.info',
    defaultMessage:
      'Existing invitations for these users with this email already exist. They were not invited.',
  },
  existingInvitations: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.existingInvitations',
    defaultMessage: 'Existing Invitations ({count})',
  },
  newCourseUsers: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.newCourseUsers',
    defaultMessage: 'New Course Users ({count})',
  },
  newInvitations: {
    id: 'course.userInvitations.components.misc.InvitationResultDialog.newInvitations',
    defaultMessage: 'New Invitations ({count})',
  },
});

const renderUsersTable = (
  intl: IntlShape,
  users: CourseUserData[],
): JSX.Element => {
  const tableHeight = users.length > 20 ? 600 : users.length * 40 + 40;
  return (
    <TableVirtuoso
      style={{ height: tableHeight }}
      data={users}
      components={{
        // eslint-disable-next-line react/display-name
        Scroller: forwardRef((props, ref) => (
          <TableContainer component={Paper} {...props} ref={ref} />
        )),
        Table: (props) => (
          <Table
            {...props}
            style={{ borderCollapse: 'separate' }}
            size="small"
          />
        ),
        TableHead,
        TableRow, // eslint-disable-next-line react/display-name
        TableBody: forwardRef((props, ref) => (
          <TableBody {...props} ref={ref} />
        )),
      }}
      fixedHeaderContent={(): JSX.Element => (
        <TableRow style={{ background: 'white' }}>
          <TableCell>{intl.formatMessage(tableTranslations.name)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.email)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.phantom)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.role)}</TableCell>
        </TableRow>
      )}
      itemContent={(_index, user): JSX.Element => (
        <>
          <TableCell>{user.name}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{user.phantom ? 'Yes' : 'No'}</TableCell>
          <TableCell>{sharedConstants.COURSE_USER_ROLES[user.role]}</TableCell>
        </>
      )}
    />
  );
};

const renderInvitationsTable = (
  intl: IntlShape,
  invitations: InvitationListData[],
): JSX.Element => {
  const tableHeight =
    invitations.length > 20 ? 600 : invitations.length * 40 + 40;
  return (
    <TableVirtuoso
      style={{ height: tableHeight }}
      data={invitations}
      components={{
        // eslint-disable-next-line react/display-name
        Scroller: forwardRef((props, ref) => (
          <TableContainer component={Paper} {...props} ref={ref} />
        )),
        Table: (props) => (
          <Table
            {...props}
            style={{ borderCollapse: 'separate' }}
            size="small"
          />
        ),
        TableHead,
        TableRow, // eslint-disable-next-line react/display-name
        TableBody: forwardRef((props, ref) => (
          <TableBody {...props} ref={ref} />
        )),
      }}
      fixedHeaderContent={(): JSX.Element => (
        <TableRow style={{ background: 'white' }}>
          <TableCell>{intl.formatMessage(tableTranslations.name)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.email)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.phantom)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.role)}</TableCell>
          <TableCell>
            {intl.formatMessage(tableTranslations.invitationSentAt)}
          </TableCell>
        </TableRow>
      )}
      itemContent={(_index, invitation): JSX.Element => (
        <>
          <TableCell>{invitation.name}</TableCell>
          <TableCell>{invitation.email}</TableCell>
          <TableCell>{invitation.phantom ? 'Yes' : 'No'}</TableCell>
          <TableCell>
            {sharedConstants.COURSE_USER_ROLES[invitation.role]}
          </TableCell>
          <TableCell>{invitation.sentAt ?? '-'}</TableCell>
        </>
      )}
    />
  );
};

const InvitationResultDialog: FC<Props> = (props) => {
  const { open, handleClose, invitationResult, intl } = props;
  const {
    duplicateUsers,
    existingCourseUsers,
    existingInvitations,
    newCourseUsers,
    newInvitations,
  } = invitationResult;

  if (!open) {
    return null;
  }

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      fullWidth
      maxWidth="lg"
      style={{
        position: 'absolute',
        top: 50,
      }}
    >
      <DialogTitle>{`${intl.formatMessage(translations.header)}`}</DialogTitle>
      <DialogContent>
        <>
          <Typography variant="body2" gutterBottom>
            {intl.formatMessage(translations.body, {
              count: newInvitations?.length ?? 0,
            })}
          </Typography>
          {duplicateUsers && duplicateUsers.length > 0 && (
            <div className="duplicates">
              <Typography variant="h6">
                <Tooltip title={intl.formatMessage(translations.duplicateInfo)}>
                  <HelpIcon style={styles.icon} />
                </Tooltip>
                {intl.formatMessage(translations.duplicateUsers, {
                  count: duplicateUsers.length,
                })}
              </Typography>
              {renderUsersTable(intl, duplicateUsers)}
            </div>
          )}
          {existingInvitations && existingInvitations.length > 0 && (
            <div className="existingInvitations">
              <Typography variant="h6">
                <Tooltip
                  title={intl.formatMessage(
                    translations.existingInvitationsInfo,
                  )}
                >
                  <HelpIcon style={styles.icon} />
                </Tooltip>
                {intl.formatMessage(translations.existingInvitations, {
                  count: existingInvitations.length,
                })}
              </Typography>
              {renderInvitationsTable(intl, existingInvitations)}
            </div>
          )}
          {existingCourseUsers && existingCourseUsers.length > 0 && (
            <div className="existingCourseUsers">
              <Typography variant="h6">
                <Tooltip
                  title={intl.formatMessage(
                    translations.existingCourseUsersInfo,
                  )}
                >
                  <HelpIcon style={styles.icon} />
                </Tooltip>
                {intl.formatMessage(translations.existingCourseUsers, {
                  count: existingCourseUsers.length,
                })}
              </Typography>
              {renderUsersTable(intl, existingCourseUsers)}
            </div>
          )}
          {newInvitations && newInvitations.length > 0 && (
            <div className="newInvitations">
              <Typography variant="h6">
                {intl.formatMessage(translations.newInvitations, {
                  count: newInvitations.length,
                })}
              </Typography>
              {renderInvitationsTable(intl, newInvitations)}
            </div>
          )}
          {newCourseUsers && newCourseUsers.length > 0 && (
            <div className="newCourseUsers">
              <Typography variant="h6">
                {intl.formatMessage(translations.newCourseUsers, {
                  count: newCourseUsers.length,
                })}
              </Typography>
              {renderUsersTable(intl, newCourseUsers)}
            </div>
          )}
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              {intl.formatMessage(translations.close)}
            </Button>
          </DialogActions>
        </>
      </DialogContent>
    </Dialog>
  );
};

export default injectIntl(InvitationResultDialog);
