import { FC, useMemo } from 'react';
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormSetValue,
} from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import MyLocation from '@mui/icons-material/MyLocation';
import { Autocomplete, Box, IconButton, Tooltip } from '@mui/material';

import {
  selectDestinationInstances,
  selectMetadata,
} from 'course/duplication/selectors/destinationInstance';
import TextField from 'lib/components/core/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface InstanceDropdownProps {
  currentInstanceId: number;
  disabled: boolean;
  field: ControllerRenderProps<FieldValues, 'destination_instance_id'>;
  fieldState: ControllerFieldState;
  setValue: UseFormSetValue<FieldValues>;
}

const translations = defineMessages({
  destinationInstance: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.InstanceDropdown.destinationInstance',
    defaultMessage: 'Destination instance',
  },
  currentInstance: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.InstanceDropdown.currentInstance',
    defaultMessage: 'Select current instance',
  },
});

const InstanceDropdown: FC<InstanceDropdownProps> = (props) => {
  const { currentInstanceId, disabled, field, fieldState, setValue } = props;
  const instances = useAppSelector(selectDestinationInstances);
  const metadata = useAppSelector(selectMetadata);
  const instanceIds = useMemo(
    () =>
      Object.keys(instances).toSorted(
        (a, b) => instances[a].weight - instances[b].weight,
      ),
    [instances],
  );
  const { t } = useTranslation();

  return (
    <div className="flex">
      <Autocomplete
        {...field}
        disabled={disabled || !metadata.canDuplicateToAnotherInstance}
        fullWidth
        getOptionLabel={(instanceId): string =>
          instances[instanceId]?.name ?? ''
        }
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
      <div className="flex items-end">
        <Tooltip title={t(translations.currentInstance)}>
          <IconButton
            disabled={disabled}
            onClick={() =>
              setValue('destination_instance_id', currentInstanceId)
            }
          >
            <MyLocation
              className={`${
                currentInstanceId === field.value ? 'text-blue-500' : ''
              }`}
            />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default InstanceDropdown;
