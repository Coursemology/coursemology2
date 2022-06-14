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
import FormToggleField from 'lib/components/form/fields/ToggleField';
import {
  IndividualInviteRowData,
  IndividualInvites,
} from 'types/course/userInvitations';
import sharedConstants from 'lib/constants/sharedConstants';
import { ManageCourseUsersPermissions } from 'types/course/courseUsers';

interface Props extends WrappedComponentProps {
  permissions: ManageCourseUsersPermissions;
  fieldsConfig: {
    control: Control<IndividualInvites>;
    fields: IndividualInviteRowData[];
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
});

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
            placeholder="Awesome User"
            label="Name"
            variant="standard"
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
            placeholder="user@example.com"
            label="Email"
            variant="standard"
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
            options={sharedConstants.USER_ROLES}
            // @ts-ignore: component is still written in JS
            label="Role"
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
              options={sharedConstants.TIMELINE_ALGORITHMS}
              // @ts-ignore: component is still written in JS
              label="Timeline Algorithm"
            />
          )}
        />
      )}
      <Controller
        name={`invitations.${index}.phantom`}
        control={fieldsConfig.control}
        render={({ field, fieldState }): JSX.Element => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            label="Phantom"
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
