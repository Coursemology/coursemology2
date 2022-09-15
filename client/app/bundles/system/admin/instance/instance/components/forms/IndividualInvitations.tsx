import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button, Divider, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  IndividualInvite,
  IndividualInvites,
} from 'types/system/instance/invitations';
import {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import IndividualInvitation from './IndividualInvitation';

interface Props extends WrappedComponentProps {
  isLoading: boolean;
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
  const { isLoading, fieldsConfig, intl } = props;
  const { append, fields } = fieldsConfig;

  const appendNewRow = (): void => {
    const lastRow = fields[fields.length - 1];
    append({
      name: '',
      email: '',
      role: lastRow.role,
    });
  };

  return (
    <>
      {fields.map(
        (field, index): JSX.Element => (
          <IndividualInvitation
            key={field.id}
            {...{ field, index, fieldsConfig }}
          />
        ),
      )}

      <Divider className="my-3 mx-0" />
      <Grid container alignItems="center">
        <LoadingButton
          className="btn-submit mr-1"
          loading={isLoading}
          variant="contained"
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
