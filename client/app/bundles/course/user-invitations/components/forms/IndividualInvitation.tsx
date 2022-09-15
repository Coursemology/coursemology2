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
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import {
  IndividualInvite,
  IndividualInvites,
} from 'types/course/userInvitations';
import {
  COURSE_USER_ROLES,
  TIMELINE_ALGORITHMS,
} from 'lib/constants/sharedConstants';
import { ManageCourseUsersPermissions } from 'types/course/courseUsers';
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
    <Grid container flexWrap="nowrap" alignItems="center">
      <Controller
        name={`invitations.${index}.name`}
        control={fieldsConfig.control}
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            // @ts-ignore: component is still written in JS
            placeholder={intl.formatMessage(translations.namePlaceholder)}
            label={intl.formatMessage(tableTranslations.name)}
            variant="standard"
            id={`name-${index}`}
            sx={styles.textInput}
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
            placeholder={intl.formatMessage(translations.emailPlaceholder)}
            label={intl.formatMessage(tableTranslations.email)}
            variant="standard"
            id={`email-${index}`}
            sx={styles.textInput}
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
            sx={styles.textInput}
          />
        )}
      />
      {permissions.canManagePersonalTimes && (
        <Controller
          name={`invitations.${index}.timelineAlgorithm`}
          control={fieldsConfig.control}
          render={({ field, fieldState }): JSX.Element => (
            <FormSelectField
              field={field}
              fieldState={fieldState}
              options={TIMELINE_ALGORITHMS}
              // @ts-ignore: component is still written in JS
              label={intl.formatMessage(tableTranslations.timelineAlgorithm)}
            />
          )}
        />
      )}
      <Controller
        name={`invitations.${index}.phantom`}
        control={fieldsConfig.control}
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
