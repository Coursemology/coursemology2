import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button, Divider, Grid } from '@mui/material';
import {
  IndividualInviteRowData,
  IndividualInvites,
} from 'types/course/userInvitations';
import { ManageCourseUsersPermissions } from 'types/course/courseUsers';
import {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import IndividualInvitation from './IndividualInvitation';

interface Props extends WrappedComponentProps {
  permissions: ManageCourseUsersPermissions;
  fieldsConfig: {
    control: Control<IndividualInvites>;
    fields: IndividualInviteRowData[];
    append: UseFieldArrayAppend<IndividualInvites, 'invitations'>;
    remove: UseFieldArrayRemove;
  };
}

const translations = defineMessages({
  addInvitation: {
    id: 'course.userInvitations.IndividualInvitations.add',
    defaultMessage: 'Add Row',
  },
  invite: {
    id: 'course.userInvitations.IndividualInvitations.remove',
    defaultMessage: 'Invite All Users',
  },
});

const IndividualInvitations: FC<Props> = (props) => {
  const { permissions, fieldsConfig, intl } = props;
  const { append, fields } = fieldsConfig;

  return (
    <>
      {fields.map(
        (field, index): JSX.Element => (
          <IndividualInvitation
            key={field.id}
            {...{ permissions, field, index, fieldsConfig }}
          />
        ),
      )}

      <Divider sx={{ margin: '12px 0px' }} />
      <Grid container alignItems="center">
        <Button
          className="btn-submit"
          variant="contained"
          sx={{ marginRight: '4px' }}
          form="invite-users-individual-form"
          key="invite-users-individual-form-submit-button"
          type="submit"
        >
          {intl.formatMessage(translations.invite)}
        </Button>
        <Button
          color="primary"
          onClick={(): void =>
            append({
              name: '',
              email: '',
              role: 'student',
              phantom: false,
              ...(permissions.canManagePersonalTimes && {
                timelineAlgorithm: 'fixed',
              }),
            })
          }
        >
          {intl.formatMessage(translations.addInvitation)}
        </Button>
      </Grid>
    </>
  );
};

export default injectIntl(IndividualInvitations);
