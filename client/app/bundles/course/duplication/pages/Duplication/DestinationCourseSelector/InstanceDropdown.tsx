import { FC, useMemo } from 'react';
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
} from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Autocomplete, Box } from '@mui/material';

import {
  selectDestinationInstances,
  selectMetadata,
} from 'course/duplication/selectors/destinationInstance';
import TextField from 'lib/components/core/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import { useAppSelector } from 'lib/hooks/store';

interface InstanceDropdownProps {
  disabled: boolean;
  field: ControllerRenderProps<FieldValues, 'destination_instance_id'>;
  fieldState: ControllerFieldState;
}

const translations = defineMessages({
  destinationInstance: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.InstanceDropdown.destinationInstance',
    defaultMessage: 'Destination Instance',
  },
});

const InstanceDropdown: FC<InstanceDropdownProps> = (props) => {
  const { disabled, field, fieldState } = props;
  const instances = useAppSelector(selectDestinationInstances);
  const metadata = useAppSelector(selectMetadata);
  const instanceIds = useMemo(() => Object.keys(instances), [instances]);

  return (
    <Autocomplete
      {...field}
      disabled={
        disabled ||
        !metadata.canDuplicateToAnotherInstance ||
        instances.length > 1
      }
      fullWidth
      getOptionLabel={(instanceId): string => instances[instanceId]?.name ?? ''}
      onChange={(_, instanceId): void =>
        field.onChange(parseInt(instanceId, 10))
      }
      options={instanceIds}
      renderInput={(inputProps): JSX.Element => (
        <TextField
          {...inputProps}
          error={!!fieldState.error}
          helperText={
            fieldState.error && formatErrorMessage(fieldState.error.message)
          }
          label={<FormattedMessage {...translations.destinationInstance} />}
          required
          variant="standard"
        />
      )}
      renderOption={(optionProps, instanceId): JSX.Element => (
        <Box component="li" {...optionProps} key={instanceId}>
          {instances[instanceId]?.name ?? ''}
        </Box>
      )}
      value={field.value?.toString()}
    />
  );
};

export default InstanceDropdown;
