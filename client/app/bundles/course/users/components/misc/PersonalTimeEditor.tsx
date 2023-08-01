import { FC, useState } from 'react';
import { Controller, useForm, UseFormHandleSubmit } from 'react-hook-form';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import Add from '@mui/icons-material/Add';
import LockOpenOutlined from '@mui/icons-material/LockOpenOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { LoadingButton } from '@mui/lab';
import { Grid, TableCell, Tooltip } from '@mui/material';
import { PersonalTimeMiniEntity } from 'types/course/personalTimes';
import * as yup from 'yup';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import SaveButton from 'lib/components/core/buttons/SaveButton';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import formTranslations from 'lib/translations/form';
import tableTranslations from 'lib/translations/table';

import { deletePersonalTime, updatePersonalTime } from '../../operations';

interface Props extends WrappedComponentProps {
  item: PersonalTimeMiniEntity;
}

const styles = {
  buttonStyle: {
    padding: '0px 8px',
  },
};

interface IFormInputs {
  fixed: boolean;
  startAt: Date | undefined;
  bonusEndAt: Date | undefined;
  endAt: Date | undefined;
}

const translations = defineMessages({
  buttonLabel: {
    id: 'course.users.PersonalTimeEditor.buttonLabel',
    defaultMessage: 'Add personal time',
  },
  createSuccess: {
    id: 'course.users.PersonalTimeEditor.createSuccess',
    defaultMessage: 'Created new personal time for {title}!',
  },
  update: {
    id: 'course.users.PersonalTimeEditor.update',
    defaultMessage: 'Update personal time',
  },
  updateSuccess: {
    id: 'course.users.PersonalTimeEditor.updateSuccess',
    defaultMessage: 'Updated personal time for {title}!',
  },
  updateFailure: {
    id: 'course.users.PersonalTimeEditor.updateFailure',
    defaultMessage: 'Unable to update personal time - {error}',
  },
  delete: {
    id: 'course.users.PersonalTimeEditor.delete',
    defaultMessage: 'Delete personal time',
  },
  deleteConfirm: {
    id: 'course.users.PersonalTimeEditor.deleteConfirm',
    defaultMessage:
      'Are you sure you want to delete personal time for {title}?',
  },
  deleteSuccess: {
    id: 'course.users.PersonalTimeEditor.deleteSuccess',
    defaultMessage: 'Deleted personal time for {title}.',
  },
  deleteFailure: {
    id: 'course.users.PersonalTimeEditor.deleteFailure',
    defaultMessage: 'Failed to delete personal time - {error}',
  },
  startEndValidationError: {
    id: 'course.users.PersonalTimeEditor.error.startEndValidation',
    defaultMessage: 'Must be after start time',
  },
  fixedDescription: {
    id: 'course.users.PersonalTimeEditor.fixedDescription',
    defaultMessage:
      "A fixed personal time means that the personal time will no longer be automatically modified. If a personal\
    time is left unfixed, it may be dynamically updated by the algorithm on the user's next submission.",
  },
});

const validationSchema = yup.object({
  startAt: yup.date().nullable().typeError(formTranslations.invalidDate),
  endAt: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
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
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isDirty },
  } = useForm<IFormInputs>({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });
  const { userId } = useParams();
  const [isCreating, setIsCreating] = useState(!item.new);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();

  const handleCreate = (): void => {
    setIsCreating(true);
  };

  const handleDelete = (): Promise<void> => {
    setIsCreating(false);
    if (item.new) {
      return new Promise<void>(() => {});
    }
    setIsDeleting(true);
    return dispatch(deletePersonalTime(item.personalTimeId!, +userId!))
      .then(() => {
        reset(initialValues);
        toast.success(
          intl.formatMessage(translations.deleteSuccess, {
            title: item.title,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.deleteFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const onSubmit = (formData: IFormInputs): Promise<void> => {
    const data = {
      ...formData,
      id: item.id,
    };
    setIsSaving(true);
    return dispatch(updatePersonalTime(data, +userId!))
      .then(() => {})
      .finally(() => {
        reset(formData);
        setIsSaving(false);
        if (item.new) {
          toast.success(
            intl.formatMessage(translations.createSuccess, {
              title: item.title,
            }),
          );
        } else {
          toast.success(
            intl.formatMessage(translations.updateSuccess, {
              title: item.title,
            }),
          );
        }
      })
      .catch((error) => {
        toast.error(
          intl.formatMessage(translations.updateFailure, {
            error: error.response.data.errors,
          }),
        );
        setReactHookFormError(setError, error.response.data.errors);
      });
  };

  if (!isCreating) {
    return (
      <TableCell colSpan={4}>
        <Grid alignItems="center" container flexDirection="column">
          <LoadingButton
            loading={isCreating}
            onClick={handleCreate}
            size="small"
            startIcon={<Add />}
          >
            {intl.formatMessage(translations.buttonLabel)}
          </LoadingButton>
        </Grid>
      </TableCell>
    );
  }

  return (
    <>
      <Tooltip
        arrow
        placement="top"
        title={intl.formatMessage(translations.fixedDescription)}
      >
        <TableCell>
          <Controller
            control={control}
            name="fixed"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                checkedIcon={<LockOutlined />}
                field={field}
                fieldState={fieldState}
                icon={<LockOpenOutlined />}
              />
            )}
          />
        </TableCell>
      </Tooltip>
      <TableCell>
        <Controller
          control={control}
          name="startAt"
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
          control={control}
          name="bonusEndAt"
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
          alignItems="center"
          container
          flexDirection="row"
          flexWrap="nowrap"
        >
          <Controller
            control={control}
            name="endAt"
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                label={<FormattedMessage {...tableTranslations.endAt} />}
              />
            )}
          />
          {isDirty && (
            <SaveButton
              className="btn-submit"
              disabled={isSaving || isDeleting}
              form={`personal-time-form-${item.id}-${item.personalTimeId}`}
              onClick={(): UseFormHandleSubmit<IFormInputs> => handleSubmit}
              size="small"
              sx={styles.buttonStyle}
              tooltip={intl.formatMessage(translations.update)}
              type="submit"
            />
          )}
          <DeleteButton
            confirmMessage={
              item.new
                ? undefined
                : intl.formatMessage(translations.deleteConfirm, {
                    title: item.title,
                  })
            }
            disabled={isSaving || isDeleting}
            loading={isDeleting}
            onClick={handleDelete}
            size="small"
            sx={styles.buttonStyle}
            tooltip={intl.formatMessage(translations.delete)}
          />
          <form
            encType="multipart/form-data"
            id={`personal-time-form-${item.id}-${item.personalTimeId}`}
            noValidate
            onSubmit={handleSubmit((data) => onSubmit(data))}
          />
        </Grid>
      </TableCell>
    </>
  );
};

export default injectIntl(PersonalTimeEditor);
