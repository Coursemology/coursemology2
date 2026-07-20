import { FC, useMemo } from 'react';
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormSetValue,
} from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import MyLocation from '@mui/icons-material/MyLocation';
import { IconButton, Tooltip } from '@mui/material';

import { selectDestinationInstances } from 'course/duplication/selectors';
import InstanceAutocomplete, {
  InstanceOption,
} from 'lib/components/core/fields/InstanceAutocomplete';
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
  const options = useMemo<InstanceOption[]>(
    () =>
      Object.keys(instances)
        .toSorted((a, b) => instances[a].weight - instances[b].weight)
        .map((id) => ({
          id: parseInt(id, 10),
          name: instances[id]?.name ?? '',
        })),
    [instances],
  );
  const { t } = useTranslation();

  return (
    <div className="flex">
      <InstanceAutocomplete
        disabled={disabled || !options.length}
        error={!!fieldState.error}
        helperText={
          fieldState.error && formatErrorMessage(fieldState.error.message)
        }
        label={<FormattedMessage {...translations.destinationInstance} />}
        onBlur={field.onBlur}
        onChange={(instanceId): void => field.onChange(instanceId)}
        options={options}
        required
        value={field.value ?? null}
      />
      <div className="flex items-end">
        <Tooltip title={t(translations.currentInstance)}>
          <IconButton
            disabled={disabled || !(currentInstanceId in instances)}
            onClick={(): void =>
              setValue('destination_instance_id', currentInstanceId)
            }
          >
            <MyLocation
              className={
                currentInstanceId === field.value ? 'text-blue-500' : ''
              }
            />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default InstanceDropdown;
