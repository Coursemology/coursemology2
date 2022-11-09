import { FC, useEffect, useState, memo, useMemo } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import {
  DisbursementFormData,
  ForumDisbursementFilters,
  ForumDisbursementFormData,
  ForumDisbursementUserEntity,
} from 'types/course/disbursement';
import ErrorText from 'lib/components/core/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import { Button, Grid } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import equal from 'fast-deep-equal';
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
    const obj = forumUsers.reduce(
      (accumulator, value) => {
        return { ...accumulator, [`courseUser_${value.id}`]: value.points };
      },
      { reason: intl.formatMessage(translations.reasonFill) },
    );

    return obj;
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
        noValidate
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
                  className="forum_disbursement_reason"
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
              className="forum-btn-submit"
              disabled={isSubmitting}
              form="forum-form"
              key="forum-form-submit-button"
              type="submit"
              variant="outlined"
              style={{ marginBottom: '10px', marginTop: '10px' }}
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
