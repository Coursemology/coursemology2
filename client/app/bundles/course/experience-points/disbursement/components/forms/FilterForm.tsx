import { FC, memo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { toast } from 'react-toastify';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Grid } from '@mui/material';
import equal from 'fast-deep-equal';
import { ForumDisbursementFilters } from 'types/course/disbursement';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormTextField from 'lib/components/form/fields/TextField';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { useAppDispatch } from 'lib/hooks/store';
import formTranslations from 'lib/translations/form';

import { fetchFilteredForumDisbursements } from '../../operations';
import { actions } from '../../store';

interface Props extends WrappedComponentProps {
  initialValues: ForumDisbursementFilters;
}

const translations = defineMessages({
  startTime: {
    id: 'course.experiencePoints.disbursement.FilterForm.startTime',
    defaultMessage: 'Start Date *',
  },
  endTime: {
    id: 'course.experiencePoints.disbursement.FilterForm.endTime',
    defaultMessage: 'End Date *',
  },
  weeklyCap: {
    id: 'course.experiencePoints.disbursement.FilterForm.weeklyCap',
    defaultMessage: 'Weekly Cap',
  },
  submit: {
    id: 'course.experiencePoints.disbursement.FilterForm.submit',
    defaultMessage: 'Search',
  },
  fetchFilterNone: {
    id: 'course.experiencePoints.disbursement.DisbursementForm.fetchFilterNone',
    defaultMessage: 'No post made between these 2 dates.',
  },
  fetchFilterFailure: {
    id: 'course.experiencePoints.disbursement.DisbursementForm.fetchFilterFailure',
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
  const dispatch = useAppDispatch();

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
    dispatch(actions.removeForumDisbursementList());
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
      });
  };

  return (
    <form
      className="forum-participation-search-panel"
      encType="multipart/form-data"
      id="filter-form"
      noValidate
      onSubmit={handleSubmit((data) => onFormSubmit(data))}
      style={{ width: '100%' }}
    >
      <ErrorText errors={errors} />
      <Grid columnSpacing={2} container direction="row" rowSpacing={2}>
        <Grid item xs>
          <Controller
            control={control}
            name="startTime"
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                className="start_time"
                disabled={isSearching}
                field={field}
                fieldState={fieldState}
                label={<FormattedMessage {...translations.startTime} />}
              />
            )}
          />
        </Grid>
        <Grid item xs>
          <Controller
            control={control}
            name="endTime"
            render={({ field, fieldState }): JSX.Element => (
              <FormDateTimePickerField
                className="end_time"
                disabled={isSearching}
                field={field}
                fieldState={fieldState}
                label={<FormattedMessage {...translations.endTime} />}
              />
            )}
          />
        </Grid>
        <Grid item xs>
          <Controller
            control={control}
            name="weeklyCap"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                className="weekly_cap"
                disabled={isSearching}
                disableMargins
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={intl.formatMessage(translations.weeklyCap)}
                onWheel={(event): void => event.currentTarget.blur()}
                required
                type="number"
                variant="standard"
              />
            )}
          />
        </Grid>
        <Grid item>
          <LoadingButton
            key="filter-form-submit-button"
            className="filter-btn-submit"
            color="primary"
            disabled={isSearching}
            form="filter-form"
            loading={isSearching}
            style={{ marginBottom: '10px', marginTop: '10px' }}
            type="submit"
            variant="outlined"
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
