import { FC, useState } from 'react';
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

import { parseInvitationInput } from 'course/user-invitations/operations';
import { InvitationEntry } from 'course/user-invitations/types';
import ErrorText from 'lib/components/core/ErrorText';
import TextField from 'lib/components/core/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

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
    id: 'course.userInvitations.IndividualInvitations.appendNewRow',
    defaultMessage: 'Add Row',
  },
  invite: {
    id: 'course.userInvitations.IndividualInvitations.invite',
    defaultMessage: 'Invite All Users',
  },
  nameEmailInput: {
    id: 'course.userInvitations.IndividualInvitations.nameEmailInput',
    defaultMessage:
      "John Doe '<john.doe@example.org'>; \"Doe, Jane\" '<jane.doe@example.org'>; ...",
  },
  addRowsByEmail: {
    id: 'course.userInvitations.IndividualInvitations.addRowsByEmail',
    defaultMessage: 'Add Rows by Email',
  },
  malformedEmail: {
    id: 'course.userInvitations.IndividualInvitations.malformedEmail',
    defaultMessage:
      '{n, plural, one {This email is } other {These emails are }} wrongly formatted: {emails}',
  },
});

const IndividualInvitations: FC<Props> = (props) => {
  const { isLoading, permissions, fieldsConfig, intl } = props;
  const { append, remove, fields } = fieldsConfig;

  const { t } = useTranslation();

  const [nameEmailInput, setNameEmailInput] = useState('');

  const appendRow = (
    lastRow: IndividualInvite,
    entry?: InvitationEntry,
  ): void => {
    append({
      name: entry?.name ?? '',
      email: entry?.email ?? '',
      role: lastRow.role,
      phantom: lastRow.phantom,
      ...(permissions.canManagePersonalTimes && {
        timelineAlgorithm: lastRow.timelineAlgorithm,
      }),
    });
  };

  const appendNewRow = (): void => {
    const lastRow = fields[fields.length - 1];
    appendRow(lastRow, undefined);
  };

  const appendInputs = (results: InvitationEntry[]): void => {
    const lastRow = fields[fields.length - 1];

    for (let idx = fields.length - 1; idx >= 0; idx--) {
      const { name, email } = fields[idx];
      if (!name && !email) remove(idx);
    }

    results.forEach((entry) => appendRow(lastRow, entry));
  };

  const parsedInput = parseInvitationInput(nameEmailInput);

  return (
    <>
      <div className="flex items-center gap-3">
        <TextField
          className="w-full"
          hiddenLabel
          multiline
          name="nameEmailInvitation"
          onChange={(e): void => setNameEmailInput(e.target.value)}
          placeholder={t(translations.nameEmailInput)}
          size="small"
          value={nameEmailInput}
          variant="filled"
        />
        <Button
          className="whitespace-nowrap"
          color="primary"
          onClick={(): void => {
            appendInputs(parsedInput.results);
            setNameEmailInput(parsedInput.errors.join('; '));
          }}
          variant="outlined"
        >
          {t(translations.addRowsByEmail)}
        </Button>
      </div>

      {parsedInput.errors.length > 0 && (
        <div className="mt-1">
          <ErrorText
            errors={t(translations.malformedEmail, {
              n: parsedInput.errors.length,
              emails: parsedInput.errors.join(', '),
            })}
          />
        </div>
      )}

      {fields.map(
        (field, index): JSX.Element => (
          <IndividualInvitation
            key={field.id}
            {...{ permissions, field, index, fieldsConfig }}
          />
        ),
      )}

      <Divider sx={{ margin: '12px 0px' }} />
      <Grid alignItems="center" container>
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
