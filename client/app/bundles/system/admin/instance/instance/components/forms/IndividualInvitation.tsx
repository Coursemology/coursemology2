import { Close } from '@mui/icons-material';
import { Box, Grid, IconButton, Tooltip } from '@mui/material';
import { FC } from 'react';
import {
  Control,
  Controller,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import {
  IndividualInvite,
  IndividualInvites,
} from 'types/system/instance/invitations';
import { INSTANCE_USER_ROLES } from 'lib/constants/sharedConstants';
import tableTranslations from 'lib/translations/table';

interface Props extends WrappedComponentProps {
  fieldsConfig: {
    control: Control<IndividualInvites>;
    fields: IndividualInvite[];
    append: UseFieldArrayAppend<IndividualInvites, 'invitations'>;
    remove: UseFieldArrayRemove;
  };
  index: number;
}

const translations = defineMessages({
  removeInvitation: {
    id: 'system.admin.instance.userInvitations.IndividualInvitations.remove',
    defaultMessage: 'Remove Invitation',
  },
  namePlaceholder: {
    id: 'system.admin.instance.userInvitations.IndividualInvitations.name.placeholder',
    defaultMessage: 'Name',
  },
  emailPlaceholder: {
    id: 'system.admin.instance.userInvitations.IndividualInvitations.email.placeholder',
    defaultMessage: 'user@example.com',
  },
});

const userRoleOptions = Object.keys(INSTANCE_USER_ROLES).map((roleValue) => ({
  label: INSTANCE_USER_ROLES[roleValue],
  value: roleValue,
}));

const IndividualInvitation: FC<Props> = (props) => {
  const { fieldsConfig, index, intl } = props;

  const renderInvitationBody = (
    <Grid container flexWrap="nowrap" alignItems="center">
      <Controller
        name={`invitations.${index}.name`}
        control={fieldsConfig.control}
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            // @ts-ignore: component is still written in JS
            fullWidth
            placeholder={intl.formatMessage(translations.namePlaceholder)}
            label={intl.formatMessage(tableTranslations.name)}
            variant="standard"
            id={`name-${index}`}
          />
        )}
      />
      <Controller
        name={`invitations.${index}.email`}
        control={fieldsConfig.control}
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            // @ts-ignore: component is still written in JS
            fullWidth
            placeholder={intl.formatMessage(translations.emailPlaceholder)}
            label={intl.formatMessage(tableTranslations.email)}
            variant="standard"
            id={`email-${index}`}
          />
        )}
      />
      <Controller
        name={`invitations.${index}.role`}
        control={fieldsConfig.control}
        render={({ field, fieldState }): JSX.Element => (
          <FormSelectField
            field={field}
            fieldState={fieldState}
            options={userRoleOptions}
            // @ts-ignore: component is still written in JS
            label={intl.formatMessage(tableTranslations.role)}
          />
        )}
      />
    </Grid>
  );

  return (
    <Box className="flex items-center justify-start" key={index}>
      {renderInvitationBody}
      <Tooltip title={intl.formatMessage(translations.removeInvitation)}>
        <IconButton onClick={(): void => fieldsConfig.remove(index)}>
          <Close />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default injectIntl(IndividualInvitation);
