import { FC, useState, memo, useMemo } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import {
  DisbursementCourseGroupMiniEntity,
  DisbursementCourseUserMiniEntity,
  DisbursementFormData,
} from 'types/course/disbursement';
import ErrorText from 'lib/components/core/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import { Autocomplete, Button, Grid, TextField } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { createDisbursement } from '../../operations';
import { getAllCourseGroupMiniEntities } from '../../selectors';
import DisbursementTable from '../tables/DisbursementTable';

interface Props extends WrappedComponentProps {
  courseUsers: DisbursementCourseUserMiniEntity[];
}

const translations = defineMessages({
  reason: {
    id: 'course.experience-points.disbursement.DisbursementForm.reason',
    defaultMessage: 'Reason For Disbursement',
  },
  filter: {
    id: 'course.experience-points.disbursement.DisbursementForm.filter',
    defaultMessage: 'Filter by group',
  },
  fetchDisbursementFailure: {
    id: 'course.experience-points.disbursement.DisbursementForm.fetch.failure',
    defaultMessage: 'Failed to retrieve data.',
  },
  submit: {
    id: 'course.experience-points.disbursement.DisbursementForm.submit',
    defaultMessage: 'Disburse Points',
  },
  createDisbursementSuccess: {
    id: 'course.experience-points.disbursement.DisbursementForm.createDisbursementSuccess',
    defaultMessage:
      'Experience points disbursed to {recipientCount} recipients.',
  },
  createDisbursementFailure: {
    id: 'course.experience-points.disbursement.DisbursementForm.createDisbursementFailure',
    defaultMessage: 'Failed to award experience points.',
  },
  noDisbursement: {
    id: 'course.experience-points.disbursement.DisbursementForm.noDisbursement',
    defaultMessage: 'No points are disbursed to users.',
  },
  notNumber: {
    id: 'course.experience-points.disbursement.DisbursementForm.notNumber',
    defaultMessage: 'Not a Number.',
  },
});

const validationSchema = yup.object({
  reason: yup.string().required(formTranslations.required),
});

const DisbursementForm: FC<Props> = (props) => {
  const { intl, courseUsers } = props;

  const courseGroups = useSelector((state: AppState) =>
    getAllCourseGroupMiniEntities(state),
  );

  const [filteredGroup, setFilteredGroup] =
    useState<DisbursementCourseGroupMiniEntity | null>(null);
  const filteredCourseUsers = useMemo(() => {
    if (filteredGroup) {
      const filteredData = courseUsers.filter((courseUser) =>
        courseUser.groupIds.includes(filteredGroup.id),
      );
      return filteredData;
    }
    return courseUsers;
  }, [filteredGroup]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const initialValues: DisbursementFormData = useMemo(() => {
    const obj = courseUsers.reduce(
      (accumulator, value) => {
        return { ...accumulator, [`courseUser_${value.id}`]: '' };
      },
      { reason: '' },
    );

    return obj;
  }, []);

  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = methods;

  const onChangeFilter = (
    _event,
    value: DisbursementCourseGroupMiniEntity | null,
  ): void => {
    setFilteredGroup(value);
  };

  const onFormSubmit = (data: DisbursementFormData): void => {
    setIsSubmitting(true);
    const courseUserFields = filteredCourseUsers.map(
      (user) => `courseUser_${user.id}`,
    );
    const filteredPoints = Object.keys(data)
      .filter((key) => courseUserFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    const isPointEmpty = !Object.values(filteredPoints).some(Boolean);

    if (isPointEmpty) {
      toast.error(intl.formatMessage(translations.noDisbursement));
      setIsSubmitting(false);
    } else {
      dispatch(createDisbursement(data, filteredCourseUsers))
        .then((response) => {
          const recipientCount = response.data?.count;
          toast.success(
            intl.formatMessage(translations.createDisbursementSuccess, {
              recipientCount,
            }),
          );
          setIsSubmitting(false);
        })
        .catch((error) => {
          toast.error(
            intl.formatMessage(translations.createDisbursementFailure),
          );
          if (error.response?.data) {
            setReactHookFormError(setError, error.response.data.errors);
          }
          setIsSubmitting(false);
        });
    }
  };

  const onClickRemove = (): void => {
    filteredCourseUsers.forEach((user) =>
      setValue(`courseUser_${user.id}`, ''),
    );
  };

  const onClickCopy = (): void => {
    const firstPoint = watch(`courseUser_${filteredCourseUsers[0].id}`);
    filteredCourseUsers.forEach((user) =>
      setValue(`courseUser_${user.id}`, firstPoint),
    );
  };

  return (
    <>
      <Autocomplete
        className="filter-group max-w-lg"
        disablePortal
        clearOnEscape
        options={courseGroups}
        getOptionLabel={(option): string => option.name}
        isOptionEqualToValue={(option, val): boolean =>
          option.name === val.name
        }
        renderInput={(params): React.ReactNode => {
          return (
            <TextField
              {...params}
              label={intl.formatMessage(translations.filter)}
            />
          );
        }}
        onChange={onChangeFilter}
        value={filteredGroup}
      />
      <FormProvider {...methods}>
        <form
          encType="multipart/form-data"
          id="disbursement-form"
          noValidate
          onSubmit={handleSubmit((data) => {
            onFormSubmit(data);
          })}
        >
          <ErrorText errors={errors} />
          <Grid container direction="row" columnSpacing={2} rowSpacing={2}>
            <Grid item xs>
              <Controller
                control={control}
                name="reason"
                render={({ field, fieldState }): JSX.Element => (
                  <FormTextField
                    field={field}
                    fieldState={fieldState}
                    label={<FormattedMessage {...translations.reason} />}
                    // @ts-ignore: component is still written in JS
                    className="experience_points_disbursement_reason"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                    variant="standard"
                  />
                )}
              />
            </Grid>
            <Grid item>
              <Button
                color="primary"
                className="general-btn-submit"
                disabled={!isDirty || isSubmitting}
                form="disbursement-form"
                key="disbursement-form-submit-button"
                type="submit"
                variant="outlined"
                style={{ marginBottom: '10px', marginTop: '10px' }}
              >
                <FormattedMessage {...translations.submit} />
              </Button>
            </Grid>
          </Grid>
          <DisbursementTable
            filteredUsers={filteredCourseUsers}
            onClickRemove={onClickRemove}
            onClickCopy={onClickCopy}
          />
        </form>
      </FormProvider>
    </>
  );
};

export default memo(
  injectIntl(DisbursementForm),
  (prevProps, nextProps) =>
    prevProps.courseUsers.length === nextProps.courseUsers.length,
);
