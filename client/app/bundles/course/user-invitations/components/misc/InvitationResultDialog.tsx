import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import {
  defineMessages,
  injectIntl,
  IntlShape,
  WrappedComponentProps,
} from 'react-intl';
import { InvitationData, InvitationResult } from 'types/course/userInvitations';
import HelpIcon from '@mui/icons-material/Help';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import sharedConstants from 'lib/constants/sharedConstants';
import { CourseUserData } from 'types/course/courseUsers';
import tableTranslations from 'lib/components/tables/translations';

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
    defaultMessage: 'Duplicate Users ({count})',
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
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{intl.formatMessage(tableTranslations.name)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.email)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.phantom)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.role)}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} hover>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.phantom ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              {sharedConstants.USER_ROLES.find(
                (role) => role.value === user.role,
              )?.label ?? '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const renderInvitationsTable = (
  intl: IntlShape,
  invitations: InvitationData[],
): JSX.Element => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{intl.formatMessage(tableTranslations.name)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.email)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.phantom)}</TableCell>
          <TableCell>{intl.formatMessage(tableTranslations.role)}</TableCell>
          <TableCell>
            {intl.formatMessage(tableTranslations.invitationSentAt)}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {invitations.map((invitation) => (
          <TableRow key={invitation.id} hover>
            <TableCell>{invitation.name}</TableCell>
            <TableCell>{invitation.email}</TableCell>
            <TableCell>{invitation.phantom ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              {sharedConstants.USER_ROLES.find(
                (role) => role.value === invitation.role,
              )?.label ?? '-'}
            </TableCell>
            <TableCell>{invitation.sentAt ?? '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
              <Accordion TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="duplicates"
                >
                  <Typography variant="h6">
                    <Tooltip
                      title={intl.formatMessage(translations.duplicateInfo)}
                    >
                      <HelpIcon style={styles.icon} />
                    </Tooltip>
                    {intl.formatMessage(translations.duplicateUsers, {
                      count: duplicateUsers.length,
                    })}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderUsersTable(intl, duplicateUsers)}
                </AccordionDetails>
              </Accordion>
            </div>
          )}
          {existingCourseUsers && existingCourseUsers.length > 0 && (
            <div className="existingCourseUsers">
              <Accordion TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="existingCourseUsers"
                >
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
                </AccordionSummary>
                <AccordionDetails>
                  {renderUsersTable(intl, existingCourseUsers)}
                </AccordionDetails>
              </Accordion>
            </div>
          )}
          {existingInvitations && existingInvitations.length > 0 && (
            <div className="existingInvitations">
              <Accordion TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="existingInvitations"
                >
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
                </AccordionSummary>
                <AccordionDetails>
                  {renderInvitationsTable(intl, existingInvitations)}
                </AccordionDetails>
              </Accordion>
            </div>
          )}
          {newCourseUsers && newCourseUsers.length > 0 && (
            <div className="newCourseUsers">
              <Accordion TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="newCourseUsers"
                >
                  <Typography variant="h6">
                    {intl.formatMessage(translations.newCourseUsers, {
                      count: newCourseUsers.length,
                    })}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderUsersTable(intl, newCourseUsers)}
                </AccordionDetails>
              </Accordion>
            </div>
          )}
          {newInvitations && newInvitations.length > 0 && (
            <div className="newInvitations">
              <Accordion TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="newInvitations"
                >
                  <Typography variant="h6">
                    {intl.formatMessage(translations.newInvitations, {
                      count: newInvitations.length,
                    })}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderInvitationsTable(intl, newInvitations)}
                </AccordionDetails>
              </Accordion>
              <></>
            </div>
          )}
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Close
            </Button>
          </DialogActions>
        </>
      </DialogContent>
    </Dialog>
  );
};

export default injectIntl(InvitationResultDialog);
