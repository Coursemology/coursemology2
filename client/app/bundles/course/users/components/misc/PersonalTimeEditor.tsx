import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { AppDispatch } from 'types/store';
import { PersonalTimeEntity } from 'types/course/personalTimes';
import {
  Controller,
  useForm,
  UseFormHandleSubmit,
  UseFormSetError,
} from 'react-hook-form';
import * as yup from 'yup';
import Add from '@mui/icons-material/Add';
import { LoadingButton } from '@mui/lab';
import { Grid, TableCell } from '@mui/material';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import SaveButton from 'lib/components/buttons/SaveButton';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { toast } from 'react-toastify';
import tableTranslations from 'lib/components/tables/translations';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { deletePersonalTime, updatePersonalTime } from '../../operations';

interface Props extends WrappedComponentProps {
  item: PersonalTimeEntity;
}

interface IFormInputs {
  fixed: boolean;
  startAt: Date | undefined;
  bonusEndAt: Date | undefined;
  endAt: Date | undefined;
}

const translations = defineMessages({
  buttonLabel: {
    id: 'course.users.components.misc.PersonalTimeEditor.buttonLabel',
    defaultMessage: 'Add personal time',
  },
  createSuccess: {
    id: 'course.users.components.misc.PersonalTimeEditor.create.success',
    defaultMessage: 'Created new personal time!',
  },
  createFailure: {
    id: 'course.users.components.misc.PersonalTimeEditor.create.failure',
    defaultMessage: 'Unable to create new personal time',
  },
  update: {
    id: 'course.users.components.misc.PersonalTimeEditor.update',
    defaultMessage: 'Update personal time',
  },
  updateSuccess: {
    id: 'course.users.components.misc.PersonalTimeEditor.update.success',
    defaultMessage: 'Updated personal time for {title}!',
  },
  updateFailure: {
    id: 'course.users.components.misc.PersonalTimeEditor.update.failure',
    defaultMessage: 'Unable to update personal time. {error}',
  },
  delete: {
    id: 'course.users.components.misc.PersonalTimeEditor.delete',
    defaultMessage: 'Delete personal time',
  },
  deleteConfirm: {
    id: 'course.users.components.misc.PersonalTimeEditor.delete.confirm',
    defaultMessage:
      'Are you sure you want to delete personal time for {title}?',
  },
  deleteSuccess: {
    id: 'course.users.components.misc.PersonalTimeEditor.delete.success',
    defaultMessage: 'Deleted personal time!',
  },
  deleteFailure: {
    id: 'course.users.components.misc.PersonalTimeEditor.delete.failure',
    defaultMessage: 'Failed to delete personal time.',
  },
  startEndValidationError: {
    id: 'course.users.components.misc.PersonalTimeEditor.error.startEndValidation',
    defaultMessage: 'Must be after start time',
  },
});

const validationSchema = yup.object({
  startAt: yup.date().nullable(),
  endAt: yup
    .date()
    .nullable()
    .min(yup.ref('startAt'), translations.startEndValidationError),
  bonusEndAt: yup.date().nullable(),
});

const PersonalTimeEditor: FC<Props> = (props) => {
  const { item, intl } = props;
  const initialValues = {
    fixed: item.fixed,
    startAt: item.personalStartAt,
    bonusEndAt: item.personalBonusEndAt,
    endAt: item.personalEndAt,
  };
  const { control, handleSubmit, setError, reset } = useForm<IFormInputs>({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });
  const { userId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleCreate = (): Promise<void> => {
    const data = {
      id: item.id,
      fixed: item.fixed,
      startAt: item.itemStartAt,
      bonusEndAt: item.itemBonusEndAt,
      endAt: item.itemEndAt,
    };
    setIsCreating(true);
    return dispatch(updatePersonalTime(data, +userId!))
      .then(() => {
        reset(initialValues);
      })
      .finally(() => {
        setIsCreating(false);
        toast.success(intl.formatMessage(translations.createSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.createFailure));
        throw error;
      });
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deletePersonalTime(item.personalTimeId!, +userId!))
      .then(() => {
        reset(initialValues);
        toast.success(intl.formatMessage(translations.deleteSuccess));
      })
      .finally(() => {
        setIsDeleting(false);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deleteFailure));
        throw error;
      });
  };

  const onSubmit = (
    formData: IFormInputs,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    setError: UseFormSetError<IFormInputs>,
  ): Promise<void> => {
    const data = {
      ...formData,
      id: item.id,
    };
    setIsSaving(true);
    return dispatch(updatePersonalTime(data, +userId!))
      .then(() => {})
      .finally(() => {
        setIsSaving(false);
        toast.success(
          intl.formatMessage(translations.updateSuccess, {
            title: item.title,
          }),
        );
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.updateFailure, {
            error: error.response.data.errors,
          }),
        );
        setReactHookFormError(setError, error.response.data.errors);
        throw error;
      });
  };

  return (
    <>
      {item.new ? (
        <TableCell colSpan={4}>
          <Grid container flexDirection="column" alignItems="center">
            <LoadingButton
              loading={isCreating}
              onClick={handleCreate}
              startIcon={<Add />}
              size="small"
            >
              {intl.formatMessage(translations.buttonLabel)}
            </LoadingButton>
          </Grid>
        </TableCell>
      ) : (
        <>
          <TableCell>
            <Controller
              name="fixed"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormToggleField field={field} fieldState={fieldState} />
              )}
            />
          </TableCell>
          <TableCell>
            <Controller
              name="startAt"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  field={field}
                  fieldState={fieldState}
                  label={<FormattedMessage {...tableTranslations.startAt} />}
                />
              )}
            />
          </TableCell>
          <TableCell>
            <Controller
              name="bonusEndAt"
              control={control}
              render={({ field, fieldState }): JSX.Element => (
                <FormDateTimePickerField
                  field={field}
                  fieldState={fieldState}
                  label={<FormattedMessage {...tableTranslations.bonusEndAt} />}
                />
              )}
            />
          </TableCell>
          <TableCell>
            <Grid
              container
              flexDirection="row"
              flexWrap="nowrap"
              alignItems="center"
            >
              <Controller
                name="endAt"
                control={control}
                render={({ field, fieldState }): JSX.Element => (
                  <FormDateTimePickerField
                    field={field}
                    fieldState={fieldState}
                    label={<FormattedMessage {...tableTranslations.endAt} />}
                  />
                )}
              />
              <SaveButton
                tooltip={intl.formatMessage(translations.update)}
                disabled={isCreating || isSaving || isDeleting}
                onClick={(): UseFormHandleSubmit<IFormInputs> => handleSubmit}
                className="btn-submit"
                form={`personal-time-form-${item.personalTimeId}`}
                type="submit"
                size="small"
              />
              <DeleteButton
                tooltip={intl.formatMessage(translations.delete)}
                disabled={isCreating || isSaving || isDeleting}
                onClick={onDelete}
                confirmMessage={intl.formatMessage(translations.deleteConfirm, {
                  title: item.title,
                })}
                size="small"
              />
              <form
                encType="multipart/form-data"
                id={`personal-time-form-${item.personalTimeId}`}
                noValidate
                onSubmit={handleSubmit((data) => onSubmit(data, setError))}
              />
            </Grid>
          </TableCell>
        </>
      )}
    </>
  );
};

export default injectIntl(PersonalTimeEditor);
