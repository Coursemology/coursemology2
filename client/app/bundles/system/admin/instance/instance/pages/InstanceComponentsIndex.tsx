import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { ComponentData } from 'types/system/instance/components';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import tableTranslations from 'lib/translations/table';

import { indexComponents, updateComponents } from '../operations';
import { actions } from '../store';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchComponentsFailure: {
    id: 'system.admin.instance.instance.InstanceComponentsForm.fetchComponentsFailure',
    defaultMessage: 'Failed to fetch component settings.',
  },
  updateComponentsFailed: {
    id: 'system.admin.instance.instance.InstanceComponentsForm.updateComponentsFailed',
    defaultMessage: 'Instance component setting failed to be updated.',
  },
  updateComponentsSuccess: {
    id: 'system.admin.instance.instance.InstanceComponentsForm.updateComponentsSuccess',
    defaultMessage: 'Instance component setting was updated successfully.',
  },
});

const InstanceComponentsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [components, setComponents] = useState<ComponentData[]>([]);

  useEffect(() => {
    setIsLoading(true);
    indexComponents()
      .then((data) => {
        setComponents(data);
        dispatch(actions.saveComponentList(data));
      })
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchComponentsFailure)),
      )
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleChange = (updatedComponentKey: string): void => {
    setIsUpdating(true);
    updateComponents(components, updatedComponentKey)
      .then((data) => {
        setComponents(data);
        dispatch(actions.saveComponentList(data));
        toast.success(intl.formatMessage(translations.updateComponentsSuccess));
      })
      .catch(() =>
        toast.error(intl.formatMessage(translations.updateComponentsFailed)),
      )
      .finally(() => setIsUpdating(false));
  };

  if (isLoading) return <LoadingIndicator />;

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>
            {intl.formatMessage(tableTranslations.component)}
          </TableCell>
          <TableCell>
            {intl.formatMessage(tableTranslations.isEnabled)}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {components.map((component) => (
          <TableRow key={component.key} id={`component_${component.key}`}>
            <TableCell>{component.displayName}</TableCell>
            <TableCell>
              <Switch
                checked={component.enabled}
                color="primary"
                disabled={isUpdating}
                onChange={(): void => handleChange(component.key)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default injectIntl(InstanceComponentsIndex);
