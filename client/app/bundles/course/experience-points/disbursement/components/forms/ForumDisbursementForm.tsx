import { FC, useEffect, useState, memo } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import {
  DisbursementFormData,
  ForumDisbursementFilters,
  ForumDisbursementFormData,
  ForumDisbursementUserEntity,
  ForumPostData,
  ForumPostEntity,
  PointListData,
} from 'types/course/disbursement';
import ErrorText from 'lib/components/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import CloseIcon from '@mui/icons-material/Close';
import equal from 'fast-deep-equal';
import { createForumDisbursement, fetchForumPost } from '../../operations';
import PointTextField from '../fields/PointTextField';
import ForumDisbursementTable from '../tables/ForumDisbursementTable';
import ForumPostTable from '../tables/ForumPostTable';
import './DialogScroll.scss';

interface Props extends WrappedComponentProps {
  forumUsers: ForumDisbursementUserEntity[];
  numberOfUsers: number;
  filters: ForumDisbursementFilters;
  forumPosts: ForumPostEntity[];
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
  pointList: yup.array().of(
    yup.object().shape({
      points: yup
        .number()
        .transform((value, originalValue) =>
          originalValue === '' ? null : value,
        )
        .nullable(),
    }),
  ),
});

const ForumDisbursementForm: FC<Props> = (props) => {
  const { forumUsers, intl, numberOfUsers, filters, forumPosts } = props;
  const initialValues: DisbursementFormData = {
    reason: intl.formatMessage(translations.reasonFill),
    pointList: Array(numberOfUsers).fill({ points: '' }),
  };
  const dispatch = useDispatch<AppDispatch>();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });
  const [users, setUsers] = useState([] as ForumDisbursementUserEntity[]);
  const [dialogName, setDialogName] = useState('');
  const [dialogPosts, setDialogPosts] = useState(Array<ForumPostEntity>());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogUserId, setDialogUserId] = useState(-1);
  const postUserIds = new Set();

  // Creation of text field array
  const { fields, update } = useFieldArray({
    control,
    name: 'pointList',
    shouldUnregister: false,
  });

  const pointTextFieldArray: JSX.Element[] = fields.map((field, index) => (
    <PointTextField
      index={index}
      control={control}
      fieldId={field.id}
      key={field.id}
    />
  ));

  useEffect(() => {
    const newPosts: ForumPostEntity[] = forumPosts.filter(
      (postEntity: ForumPostEntity) => postEntity.userId === dialogUserId,
    );
    setDialogPosts(newPosts);
  }, [dialogUserId]);

  useEffect(() => {
    forumUsers.forEach((user: ForumDisbursementUserEntity, index) => {
      if (
        !users[index] ||
        (users[index] && users[index].points !== user.points)
      ) {
        update(index, {
          points: user.points.toString(),
        });
      }
    });
    setUsers(forumUsers);
  }, [forumUsers]);

  const onFormSubmit = (data: ForumDisbursementFormData): void => {
    setIsSubmitting(true);
    const userIdMap = forumUsers.map(
      (user: ForumDisbursementUserEntity) => user.id,
    );
    const newPointList: PointListData[] = data.pointList.map(
      (pointListData, index) => ({
        points: pointListData.points,
        id: userIdMap[index],
      }),
    );
    const newData = { ...data, pointList: newPointList };
    dispatch(createForumDisbursement(newData))
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
        throw error;
      });
  };

  const onPostClick = (user: ForumDisbursementUserEntity): void => {
    if (postUserIds.has(user.id)) {
      setDialogUserId(user.id);
      setDialogName(user.name);
    } else {
      dispatch(fetchForumPost(user, filters))
        .then((response) => {
          const data = response.data;
          setDialogName(data.name);
          const newPosts: ForumPostEntity[] = data.userPosts.map(
            (postData: ForumPostData) => ({
              ...postData,
              userId: user.id,
            }),
          );
          setDialogPosts(newPosts);
          postUserIds.add(user.id);
        })
        .catch((error) => {
          toast.error(intl.formatMessage(translations.fetchForumPostsFailure));
          throw error;
        });
    }
  };

  return (
    <>
      <form
        encType="multipart/form-data"
        id="forum-form"
        noValidate
        onSubmit={handleSubmit((data) => {
          const forumData: ForumDisbursementFormData = { ...filters, ...data };
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
              disabled={!isDirty || isSubmitting}
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
          forumUsers={users}
          pointTextFieldArray={pointTextFieldArray}
          onPostClick={onPostClick}
        />
      </form>
      <Dialog
        open={!!dialogName}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: { overflowY: 'inherit' },
        }}
        onClose={(): void => {
          setDialogName('');
        }}
      >
        <DialogTitle
          borderBottom="1px solid #ccc"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 24px',
          }}
        >
          <div>{`Posts by ${dialogName}`}</div>
          <IconButton onClick={(): void => setDialogName('')}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ height: '70vh' }}>
          <ForumPostTable posts={dialogPosts} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default memo(
  injectIntl(ForumDisbursementForm),
  (prevProps, nextProps) =>
    equal(prevProps.forumUsers, nextProps.forumUsers) &&
    equal(prevProps.forumPosts, nextProps.forumPosts) &&
    equal(prevProps.filters, nextProps.filters),
);
