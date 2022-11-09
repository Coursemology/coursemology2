import { FC } from 'react';
import {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { LoadingButton } from '@mui/lab';
import { Button, Divider, Grid } from '@mui/material';
import { ManageCourseUsersPermissions } from 'types/course/courseUsers';
import {
  IndividualInvite,
  IndividualInvites,
} from 'types/course/userInvitations';

import IndividualInvitation from './IndividualInvitation';

interface Props extends WrappedComponentProps {
  isLoading: boolean;
  permissions: ManageCourseUsersPermissions;
  fieldsConfig: {
    control: Control<IndividualInvites>;
    fields: IndividualInvite[];
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
      <Grid alignItems="center" container={true}>
        <LoadingButton
          key="invite-users-individual-form-submit-button"
          className="btn-submit"
          form="invite-users-individual-form"
          loading={isLoading}
          sx={{ marginRight: '4px' }}
          type="submit"
          variant="contained"
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
