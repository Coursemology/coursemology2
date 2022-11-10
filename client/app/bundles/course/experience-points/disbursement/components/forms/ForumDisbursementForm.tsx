import { FC, memo, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Grid } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  DisbursementFormData,
  ForumDisbursementFilters,
  ForumDisbursementFormData,
  ForumDisbursementUserEntity,
} from 'types/course/disbursement';
import { AppDispatch } from 'types/store';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import formTranslations from 'lib/translations/form';

import { createForumDisbursement } from '../../operations';
import ForumDisbursementTable from '../tables/ForumDisbursementTable';

interface Props extends WrappedComponentProps {
  forumUsers: ForumDisbursementUserEntity[];
  filters: ForumDisbursementFilters;
  onPostClick: (user: ForumDisbursementUserEntity) => void;
}

const translations = defineMessages({
  reason: {
    id: 'course.experience-points.disbursement.ForumDisbursementForm.reason',
    defaultMessage: 'Reason For Disbursement',
  },
  reasonFill: {
    id: 'course.experience-points.disbursement.ForumDisbursementForm.reasonFill',
    defaultMessage: 'Forum Participation',
  },
  submit: {
    id: 'course.experience-points.disbursement.ForumDisbursementForm.submit',
    defaultMessage: 'Disburse Points',
  },
  createDisbursementSuccess: {
    id: 'course.experience-points.disbursement.ForumDisbursementForm.createDisbursementSuccess',
    defaultMessage:
      'Experience points disbursed to {recipientCount} recipients.',
  },
  createDisbursementFailure: {
    id: 'course.experience-points.disbursement.ForumDisbursementForm.createDisbursementFailure',
    defaultMessage: 'Failed to award experience points.',
  },
  fetchForumPostsFailure: {
    id: 'course.experience-points.disbursement.ForumDisbursementForm.fetchForumPosts',
    defaultMessage: 'Failed to fetch forum posts.',
  },
});

const validationSchema = yup.object({
  reason: yup.string().required(formTranslations.required),
});

const ForumDisbursementForm: FC<Props> = (props) => {
  const { intl, filters, forumUsers, onPostClick } = props;

  const initialValues: DisbursementFormData = useMemo(() => {
    return forumUsers.reduce(
      (accumulator, value) => {
        return { ...accumulator, [`courseUser_${value.id}`]: value.points };
      },
      { reason: intl.formatMessage(translations.reasonFill) },
    );
  }, []);

  const dispatch = useDispatch<AppDispatch>();
  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = methods;

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const obj = forumUsers.reduce(
      (accumulator, value) => {
        return { ...accumulator, [`courseUser_${value.id}`]: value.points };
      },
      { reason: intl.formatMessage(translations.reasonFill) },
    );

    reset(obj);
  }, [forumUsers]);

  const onFormSubmit = (data: ForumDisbursementFormData): void => {
    setIsSubmitting(true);
    dispatch(createForumDisbursement(data, forumUsers))
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
        toast.error(intl.formatMessage(translations.createDisbursementFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        setIsSubmitting(false);
      });
  };

  return (
    <FormProvider {...methods}>
      <form
        encType="multipart/form-data"
        id="forum-form"
        noValidate={true}
        onSubmit={handleSubmit((data) => {
          const forumData: ForumDisbursementFormData = {
            ...filters,
            ...data,
          };
          onFormSubmit(forumData);
        })}
        style={{ display: forumUsers.length === 0 ? 'none' : 'contents' }}
      >
        <ErrorText errors={errors} />
        <Grid columnSpacing={2} container={true} direction="row" rowSpacing={2}>
          <Grid item={true} xs={true}>
            <Controller
              control={control}
              name="reason"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  className="forum_disbursement_reason"
                  field={field}
                  fieldState={fieldState}
                  fullWidth={true}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  label={<FormattedMessage {...translations.reason} />}
                  required={true}
                  variant="standard"
                />
              )}
            />
          </Grid>
          <Grid item={true}>
            <Button
              key="forum-form-submit-button"
              className="forum-btn-submit"
              color="primary"
              disabled={isSubmitting}
              form="forum-form"
              style={{ marginBottom: '10px', marginTop: '10px' }}
              type="submit"
              variant="outlined"
            >
              <FormattedMessage {...translations.submit} />
            </Button>
          </Grid>
        </Grid>
        <ForumDisbursementTable
          forumUsers={forumUsers}
          onPostClick={onPostClick}
        />
      </form>
    </FormProvider>
  );
};

export default memo(injectIntl(ForumDisbursementForm), (prevProps, nextProps) =>
  equal(prevProps, nextProps),
);
