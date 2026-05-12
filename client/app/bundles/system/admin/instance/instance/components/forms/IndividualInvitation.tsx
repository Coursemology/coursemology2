import { FC } from 'react';
import {
  Control,
  Controller,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Close } from '@mui/icons-material';
import { Box, Grid, IconButton, Tooltip } from '@mui/material';
import {
  IndividualInvite,
  IndividualInvites,
} from 'types/system/instance/invitations';
import { INSTANCE_USER_ROLES } from 'types/system/instance/users';

import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import instanceRoleTranslations from 'lib/translations/instance/users/roles';
import tableTranslations from 'lib/translations/table';

interface Props {
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
    id: 'system.admin.instance.instance.IndividualInvitation.removeInvitation',
    defaultMessage: 'Remove Invitation',
  },
  namePlaceholder: {
    id: 'system.admin.instance.instance.IndividualInvitation.namePlaceholder',
    defaultMessage: 'Name',
  },
  emailPlaceholder: {
    id: 'system.admin.instance.instance.IndividualInvitation.emailPlaceholder',
    defaultMessage: 'user@example.com',
  },
});

const IndividualInvitation: FC<Props> = (props) => {
  const { fieldsConfig, index } = props;
  const { t } = useTranslation();

  const userRoleOptions = INSTANCE_USER_ROLES.map((roleValue) => ({
    label: t(instanceRoleTranslations[roleValue]),
    value: roleValue,
  }));

  const renderInvitationBody = (
    <Grid alignItems="center" container flexWrap="nowrap">
      <Controller
        control={fieldsConfig.control}
        name={`invitations.${index}.name`}
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            fullWidth
            id={`name-${index}`}
            label={t(tableTranslations.name)}
            placeholder={t(translations.namePlaceholder)}
            variant="standard"
          />
        )}
      />
      <Controller
        control={fieldsConfig.control}
        name={`invitations.${index}.email`}
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            fullWidth
            id={`email-${index}`}
            label={t(tableTranslations.email)}
            placeholder={t(translations.emailPlaceholder)}
            variant="standard"
          />
        )}
      />
      <Controller
        control={fieldsConfig.control}
        name={`invitations.${index}.role`}
        render={({ field, fieldState }): JSX.Element => (
          <FormSelectField
            field={field}
            fieldState={fieldState}
            label={t(tableTranslations.role)}
            options={userRoleOptions}
          />
        )}
      />
    </Grid>
  );

  return (
    <Box key={index} className="flex items-center justify-start">
      {renderInvitationBody}
      <Tooltip title={t(translations.removeInvitation)}>
        <IconButton
          className="p-3"
          onClick={(): void => fieldsConfig.remove(index)}
        >
          <Close />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default IndividualInvitation;
