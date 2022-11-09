import { FC } from 'react';
import {
  Control,
  Controller,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
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
import tableTranslations from 'lib/translations/table';

interface Props extends WrappedComponentProps {
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
    id: 'course.userInvitations.IndividualInvitations.remove',
    defaultMessage: 'Remove Invitation',
  },
  namePlaceholder: {
    id: 'course.userInvitations.IndividualInvitations.name.placeholder',
    defaultMessage: 'Awesome User',
  },
  emailPlaceholder: {
    id: 'course.userInvitations.IndividualInvitations.email.placeholder',
    defaultMessage: 'user@example.com',
  },
});

const userRoleOptions = Object.keys(COURSE_USER_ROLES).map((roleValue) => ({
  label: COURSE_USER_ROLES[roleValue],
  value: roleValue,
}));

const IndividualInvitation: FC<Props> = (props) => {
  const { permissions, fieldsConfig, index, intl } = props;

  const renderInvitationBody = (
    <Grid alignItems="center" container={true} flexWrap="nowrap">
      <Controller
        control={fieldsConfig.control}
        name={`invitations.${index}.name`}
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            id={`name-${index}`}
            label={intl.formatMessage(tableTranslations.name)}
            placeholder={intl.formatMessage(translations.namePlaceholder)}
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
            label={intl.formatMessage(tableTranslations.email)}
            placeholder={intl.formatMessage(translations.emailPlaceholder)}
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
            label={intl.formatMessage(tableTranslations.role)}
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
              label={intl.formatMessage(tableTranslations.timelineAlgorithm)}
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
            label={intl.formatMessage(tableTranslations.phantom)}
          />
        )}
      />
    </Grid>
  );

  return (
    <Box key={index} style={styles.invitation}>
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
