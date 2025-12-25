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
import { ManageCourseUsersPermissions } from 'types/course/courseUsers';
import {
  IndividualInvite,
  IndividualInvites,
} from 'types/course/userInvitations';

import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import FormTextField from 'lib/components/form/fields/TextField';
import {
  COURSE_USER_ROLES,
  TIMELINE_ALGORITHMS,
} from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

interface Props {
  permissions: ManageCourseUsersPermissions;
  fieldsConfig: {
    control: Control<IndividualInvites>;
    fields: IndividualInvite[];
    append: UseFieldArrayAppend<IndividualInvites, 'invitations'>;
    remove: UseFieldArrayRemove;
  };
  index: number;
}

const styles = {
  invitation: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  inputs: {
    display: 'flex',
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
  },
};

const translations = defineMessages({
  removeInvitation: {
    id: 'course.userInvitations.IndividualInvitations.removeInvitation',
    defaultMessage: 'Remove Invitation',
  },
  namePlaceholder: {
    id: 'course.userInvitations.IndividualInvitations.namePlaceholder',
    defaultMessage: 'Awesome User',
  },
  emailPlaceholder: {
    id: 'course.userInvitations.IndividualInvitations.emailPlaceholder',
    defaultMessage: 'user@example.com',
  },
});

const userRoleOptions = Object.keys(COURSE_USER_ROLES).map((roleValue) => ({
  label: COURSE_USER_ROLES[roleValue],
  value: roleValue,
}));

const IndividualInvitation: FC<Props> = (props) => {
  const { permissions, fieldsConfig, index } = props;
  const { t } = useTranslation();

  const renderInvitationBody = (
    <Grid alignItems="center" container flexWrap="nowrap">
      <Controller
        control={fieldsConfig.control}
        name={`invitations.${index}.name`}
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            id={`name-${index}`}
            label={t(tableTranslations.name)}
            placeholder={t(translations.namePlaceholder)}
            sx={styles.textInput}
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
            id={`email-${index}`}
            label={t(tableTranslations.email)}
            placeholder={t(translations.emailPlaceholder)}
            sx={styles.textInput}
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
            sx={styles.textInput}
          />
        )}
      />
      {permissions.canManagePersonalTimes && (
        <Controller
          control={fieldsConfig.control}
          name={`invitations.${index}.timelineAlgorithm`}
          render={({ field, fieldState }): JSX.Element => (
            <FormSelectField
              field={field}
              fieldState={fieldState}
              label={t(tableTranslations.timelineAlgorithm)}
              options={TIMELINE_ALGORITHMS}
            />
          )}
        />
      )}
      <Controller
        control={fieldsConfig.control}
        name={`invitations.${index}.phantom`}
        render={({ field, fieldState }): JSX.Element => (
          <FormCheckboxField
            field={field}
            fieldState={fieldState}
            label={t(tableTranslations.phantom)}
          />
        )}
      />
    </Grid>
  );

  return (
    <Box key={index} style={styles.invitation}>
      {renderInvitationBody}
      <Tooltip title={t(translations.removeInvitation)}>
        <IconButton onClick={(): void => fieldsConfig.remove(index)}>
          <Close />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default IndividualInvitation;
