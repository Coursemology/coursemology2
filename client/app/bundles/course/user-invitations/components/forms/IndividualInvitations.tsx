import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button, Divider, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
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
  isLoading: boolean;
  permissions: ManageCourseUsersPermissions;
  fieldsConfig: {
    control: Control<IndividualInvites>;
    fields: IndividualInviteRowData[];
    append: UseFieldArrayAppend<IndividualInvites, 'invitations'>;
    remove: UseFieldArrayRemove;
  };
}

const translations = defineMessages({
  appendNewRow: {
    id: 'course.userInvitations.IndividualInvitations.add',
    defaultMessage: 'Add Row',
  },
  invite: {
    id: 'course.userInvitations.IndividualInvitations.remove',
    defaultMessage: 'Invite All Users',
  },
});

const IndividualInvitations: FC<Props> = (props) => {
  const { isLoading, permissions, fieldsConfig, intl } = props;
  const { append, fields } = fieldsConfig;

  const appendNewRow = (): void => {
    const lastRow = fields[fields.length - 1];
    append({
      name: '',
      email: '',
      role: lastRow.role,
      phantom: lastRow.phantom,
      ...(permissions.canManagePersonalTimes && {
        timelineAlgorithm: lastRow.timelineAlgorithm,
      }),
    });
  };

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
        <LoadingButton
          className="btn-submit"
          loading={isLoading}
          variant="contained"
          sx={{ marginRight: '4px' }}
          form="invite-users-individual-form"
          key="invite-users-individual-form-submit-button"
          type="submit"
        >
          {intl.formatMessage(translations.invite)}
        </LoadingButton>
        <Button color="primary" onClick={appendNewRow}>
          {intl.formatMessage(translations.appendNewRow)}
        </Button>
      </Grid>
    </>
  );
};

export default injectIntl(IndividualInvitations);
