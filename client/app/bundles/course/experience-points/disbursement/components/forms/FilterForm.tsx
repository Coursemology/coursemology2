import { FC, memo, useState } from 'react';
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
import { Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import { ForumDisbursementFilters } from 'types/course/disbursement';
import ErrorText from 'lib/components/core/ErrorText';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import equal from 'fast-deep-equal';
import { fetchFilteredForumDisbursements } from '../../operations';
import { removeForumDisbursementList } from '../../actions';

interface Props extends WrappedComponentProps {
  initialValues: ForumDisbursementFilters;
}

const translations = defineMessages({
  startTime: {
    id: 'course.experience-points.disbursement.FilterForm.startTime',
    defaultMessage: 'Start Date *',
  },
  endTime: {
    id: 'course.experience-points.disbursement.FilterForm.endTime',
    defaultMessage: 'End Date *',
  },
  weeklyCap: {
    id: 'course.experience-points.disbursement.FilterForm.weeklyCap',
    defaultMessage: 'Weekly Cap',
  },
  submit: {
    id: 'course.experience-points.disbursement.FilterForm.submit',
    defaultMessage: 'Search',
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

const validationSchema = yup.object({
  startTime: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .required(formTranslations.required),
  endTime: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .required(formTranslations.required)
    .min(yup.ref('startTime'), formTranslations.startEndDateValidationError),
  weeklyCap: yup
    .number()
    .typeError(formTranslations.required)
    .required(formTranslations.required),
});

const FilterForm: FC<Props> = (props) => {
  const { intl, initialValues } = props;
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

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
    setIsSearching(true);
    dispatch(removeForumDisbursementList());
    dispatch(fetchFilteredForumDisbursements(data))
      .then((response) => {
        setIsSearching(false);
        if (response.data.forumUsers.length === 0) {
          toast.error(intl.formatMessage(translations.fetchFilterNone));
        }
      })
      .catch((error) => {
        setIsSearching(false);
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
                disabled={isSearching}
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
                disabled={isSearching}
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
                field={field}
                fieldState={fieldState}
                // @ts-ignore: component is still written in JS
                className="weekly_cap"
                disabled={isSearching}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                onWheel={(event): void => event.currentTarget.blur()}
                type="number"
                variant="standard"
                disableMargins
                required
                label={intl.formatMessage(translations.weeklyCap)}
              />
            )}
          />
        </Grid>
        <Grid item>
          <LoadingButton
            color="primary"
            className="filter-btn-submit"
            form="filter-form"
            key="filter-form-submit-button"
            type="submit"
            variant="outlined"
            style={{ marginBottom: '10px', marginTop: '10px' }}
            disabled={isSearching}
            loading={isSearching}
          >
            <FormattedMessage {...translations.submit} />
          </LoadingButton>
        </Grid>
      </Grid>
    </form>
  );
};

export default memo(injectIntl(FilterForm), (prevProps, nextProps) =>
  equal(prevProps.initialValues, nextProps.initialValues),
);
