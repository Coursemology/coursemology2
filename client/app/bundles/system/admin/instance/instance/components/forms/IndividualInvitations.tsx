import { FC } from 'react';
import {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { LoadingButton } from '@mui/lab';
import { Button, Divider, Grid } from '@mui/material';
import {
  IndividualInvite,
  IndividualInvites,
} from 'types/system/instance/invitations';

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
    id: 'system.admin.instance.instance.IndividualInvitations.appendNewRow',
    defaultMessage: 'Add Row',
  },
  invite: {
    id: 'system.admin.instance.instance.IndividualInvitations.invite',
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

      <Divider className="mx-0 my-3" />
      <Grid alignItems="center" container>
        <LoadingButton
          key="invite-users-individual-form-submit-button"
          className="btn-submit mr-1"
          form="invite-users-individual-form"
          loading={isLoading}
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
