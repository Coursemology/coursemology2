import { FC, useState, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import tableTranslations from 'lib/translations/table';
import {
  ComponentMiniEntity,
  ComponentsPostData,
  InstanceComponents,
} from 'types/system/instance/components';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { getAllComponentsMiniEntities, getInstance } from '../../selectors';
import {
  fetchInstance,
  indexComponents,
  updateComponents,
} from '../../operations';

type Props = WrappedComponentProps;

const translations = defineMessages({
  help: {
    id: 'system.admin.instance.components.help',
    defaultMessage: 'Enable or disable components for the instance: {instance}',
  },
  fetchComponentsFailure: {
    id: 'system.admin.instance.components.fetch.success',
    defaultMessage: 'Failed to fetch components.',
  },
  updateComponentsSuccess: {
    id: 'system.admin.instance.components.update.success',
    defaultMessage: 'Successfully updated instance components.',
  },
  submit: {
    id: 'system.admin.instance.components.submit',
    defaultMessage: 'Submit Changes',
  },
});

const InstanceComponentsForm: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const components = useSelector(
    (state: AppState) => getAllComponentsMiniEntities(state),
    shallowEqual,
  );
  const instance = useSelector((state: AppState) => getInstance(state));
  const dispatch = useDispatch<AppDispatch>();

  const { control, handleSubmit, watch, reset } = useForm<InstanceComponents>({
    defaultValues: { components },
    mode: 'onSubmit',
  });

  const { fields } = useFieldArray({
    control,
    name: 'components',
  });

  const componentFormFields = watch('components');

  const controlledComponentFields = fields.map((field, index) => ({
    ...field,
    ...componentFormFields[index],
  }));

  useEffect(() => {
    if (components) {
      reset({ components });
    }
  }, [components]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchInstance());
    dispatch(indexComponents())
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchComponentsFailure)),
      )
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  const onSubmit = (data: ComponentsPostData): Promise<void> => {
    setIsUpdating(true);
    return dispatch(updateComponents(data)).finally(() => {
      toast.success(intl.formatMessage(translations.updateComponentsSuccess));
      setIsUpdating(false);
    });
  };

  const renderBody: JSX.Element = (
    <Box style={{ marginBottom: '8px' }}>
      <form
        encType="multipart/form-data"
        id="components"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data))}
      />
      <Typography variant="body1" style={{ marginTop: '8px' }}>
        {intl.formatMessage(translations.help, {
          instance: instance.name,
        })}
      </Typography>
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
          {controlledComponentFields.map(
            (c: ComponentMiniEntity, index): JSX.Element => (
              <TableRow hover key={c.id} id={`component_${c.key}`}>
                <TableCell>
                  <Typography
                    variant="body2"
                    gutterBottom={false}
                    className={`component_name_${c.id}`}
                  >
                    {c.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Controller
                    name={`components.${index}.enabled`}
                    control={control}
                    render={({ field, fieldState }): JSX.Element => (
                      <FormCheckboxField
                        field={field}
                        fieldState={fieldState}
                      />
                    )}
                  />
                </TableCell>
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>

      <Box style={{ marginTop: '8px' }}>
        <Button
          variant="contained"
          type="submit"
          className="btn-submit"
          disabled={isUpdating}
          form="components"
          key="update-components-submit-button"
        >
          {intl.formatMessage(translations.submit)}
        </Button>
      </Box>
    </Box>
  );

  return <>{isLoading ? <LoadingIndicator /> : <>{renderBody}</>}</>;
};

export default injectIntl(InstanceComponentsForm);
