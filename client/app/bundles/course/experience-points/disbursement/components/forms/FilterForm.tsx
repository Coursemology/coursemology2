import { FC, memo } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormTextField from 'lib/components/form/fields/TextField';
import { Button, Grid } from '@mui/material';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import { ForumDisbursementFilters } from 'types/course/disbursement';
import ErrorText from 'lib/components/ErrorText';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import equal from 'fast-deep-equal';
import { fetchFilteredForumDisbursements } from '../../operations';

interface Props extends WrappedComponentProps {
  initialValues: ForumDisbursementFilters;
}

const translations = defineMessages({
  startTime: {
    id: 'course.experience-points.disbursement.FilterForm.startTime',
    defaultMessage: 'Start time   *',
  },
  endTime: {
    id: 'course.experience-points.disbursement.FilterForm.endTime',
    defaultMessage: 'End time *',
  },
  weeklyCap: {
    id: 'course.experience-points.disbursement.FilterForm.weeklyCap',
    defaultMessage: 'Weekly Cap',
  },
  submit: {
    id: 'course.experience-points.disbursement.FilterForm.submit',
    defaultMessage: 'Search',
  },
  startEndValidationError: {
    id: 'course.experience-points.disbursement.ForumDisbursementForm.startEndValidationError',
    defaultMessage: "Must be after 'Start At'",
  },
  fetchFilterSuccess: {
    id: 'course.experience-points.disbursement.DisbursementForm.fetchFilterSuccess',
    defaultMessage: 'Successfully filtered forum users.',
  },
  fetchFilterNone: {
    id: 'course.experience-points.disbursement.DisbursementForm.fetchFilterNone',
    defaultMessage: 'No post made between these 2 dates.',
  },
  fetchFilterFailure: {
    id: 'course.experience-points.disbursement.DisbursementForm.fetchFilterFailure',
    defaultMessage: 'Failed to retrieve filtered forum users.',
  },
});

const FilterForm: FC<Props> = (props) => {
  const { intl, initialValues } = props;
  const dispatch = useDispatch<AppDispatch>();

  const validationSchema = yup.object({
    startDate: yup.date().nullable(),
    endDate: yup
      .date()
      .min(yup.ref('startDate'), translations.startEndValidationError),
    weeklyCap: yup.number().required(formTranslations.required),
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  const onFormSubmit = (data: ForumDisbursementFilters): void => {
    dispatch(fetchFilteredForumDisbursements(data))
      .then((response) => {
        if (response.data.forumUsers.length === 0) {
          toast.error(intl.formatMessage(translations.fetchFilterNone));
        } else {
          toast.success(intl.formatMessage(translations.fetchFilterSuccess));
        }
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.fetchFilterFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        throw error;
      });
  };

  return (
    <form
      encType="multipart/form-data"
      className="forum-participation-search-panel"
      id="filter-form"
      noValidate
      onSubmit={handleSubmit((data) => onFormSubmit(data))}
      style={{ width: '100%' }}
    >
      <ErrorText errors={errors} />
      <Grid container direction="row" columnSpacing={2} rowSpacing={2}>
        <Grid item xs>
          <Controller
            name="startTime"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                className="start_time"
                field={field}
                fieldState={fieldState}
                disabled={false}
                label={<FormattedMessage {...translations.startTime} />}
              />
            )}
          />
        </Grid>
        <Grid item xs>
          <Controller
            name="endTime"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                className="end_time"
                field={field}
                fieldState={fieldState}
                disabled={false}
                label={<FormattedMessage {...translations.endTime} />}
              />
            )}
          />
        </Grid>
        <Grid item xs>
          <Controller
            name="weeklyCap"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                className="weekly_cap"
                field={field}
                fieldState={fieldState}
                // @ts-ignore: component is still written in JS
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                onWheel={(event): void => event.currentTarget.blur()}
                type="number"
                variant="standard"
                margins={false}
                required
                label={intl.formatMessage(translations.weeklyCap)}
              />
            )}
          />
        </Grid>
        <Grid item>
          <Button
            color="primary"
            className="filter-btn-submit"
            form="filter-form"
            key="filter-form-submit-button"
            type="submit"
            variant="outlined"
            style={{ marginBottom: '10px', marginTop: '10px' }}
          >
            <FormattedMessage {...translations.submit} />
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default memo(injectIntl(FilterForm), (prevProps, nextProps) =>
  equal(prevProps.initialValues, nextProps.initialValues),
);
