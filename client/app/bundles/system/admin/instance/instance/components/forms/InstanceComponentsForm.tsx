import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
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
import tableTranslations from 'lib/translations/table';

import { indexComponents, updateComponents } from '../../operations';

type Props = WrappedComponentProps;

const translations = defineMessages({
  fetchComponentsFailure: {
    id: 'system.admin.instance.components.fetch.success',
    defaultMessage: 'Failed to fetch component settings.',
  },
  updateComponentsFailed: {
    id: 'system.admin.instance.components.update.failure',
    defaultMessage: 'Instance component setting failed to be updated.',
  },
  updateComponentsSuccess: {
    id: 'system.admin.instance.components.update.success',
    defaultMessage: 'Instance component setting was updated successfully.',
  },
});

const InstanceComponentsForm: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [components, setComponents] = useState<ComponentData[]>([]);

  useEffect(() => {
    setIsLoading(true);
    indexComponents()
      .then((data) => setComponents(data))
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

export default injectIntl(InstanceComponentsForm);
