import { FC, useEffect, useState, memo } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import * as yup from 'yup';
import formTranslations from 'lib/translations/form';
import {
  CourseGroupMiniEntity,
  CourseGroupOptions,
  DisbursementFormData,
  PointListData,
} from 'types/course/disbursement';
import ErrorText from 'lib/components/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import { CourseUserBasicMiniEntity } from 'types/course/courseUsers';
import { Button, Grid, Paper } from '@mui/material';
import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { createDisbursement } from '../../operations';
import {
  getAllCourseGroupMiniEntities,
  getCurrentGroup,
} from '../../selectors';
import PointTextField from '../fields/PointTextField';
import DisbursementTable from '../tables/DisbursementTable';

interface Props extends WrappedComponentProps {
  users: CourseUserBasicMiniEntity[];
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
  noneSelected: {
    id: 'course.experience-points.disbursement.DisbursementForm.noneSelected',
    defaultMessage: 'Show all students',
  },
  fetchDisbursementFailure: {
    id: 'course.experience-points.disbursement.DisbursementForm.fetch.failure',
    defaultMessage: 'Failed to retrieve Disbursements.',
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
  currentGroup: yup.string().nullable(),
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

const DisbursementForm: FC<Props> = (props) => {
  const { intl, users } = props;
  const currentGroup = useSelector((state: AppState) => getCurrentGroup(state));
  const courseGroups = useSelector((state: AppState) =>
    getAllCourseGroupMiniEntities(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  const initialValues: DisbursementFormData = {
    currentGroup: currentGroup === null ? '' : currentGroup.id.toString(),
    reason: '',
    pointList: Array(users.length).fill({ points: '' }),
  };

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });
  const [courseUsers, setCourseUsers] = useState(
    [] as CourseUserBasicMiniEntity[],
  );
  const [userIdMap, setUserIdMap] = useState([] as number[]);
  const [indexFilteredMap, setIndexFilteredMap] = useState([] as number[]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCourseUsers(users);
    setIndexFilteredMap([...Array(users.length).keys()]);
    setUserIdMap(users.map((user: CourseUserBasicMiniEntity) => user.id));
  }, [users]);

  const disbursementOptions: CourseGroupOptions[] = courseGroups.map(
    (group: CourseGroupMiniEntity) => ({
      value: group.id,
      label: group.name,
    }),
  );

  // For group filtering, name: controller name, value: groupId
  const onChangeFilter = (value: string): void => {
    if (value && !Number.isNaN(+value)) {
      const filteredUsers: CourseUserBasicMiniEntity[] = courseGroups.filter(
        (group: CourseGroupMiniEntity) => group.id === +value,
      )[0].users;
      const filteredIds = filteredUsers.map(
        (user: CourseUserBasicMiniEntity) => user.id,
      );
      const newUserIdMap = users.map(
        (user: CourseUserBasicMiniEntity) => user.id,
      );
      const newIndexMap = newUserIdMap
        .map((id, index) => (filteredIds.includes(id) ? index : -1))
        .filter((x) => x !== -1);
      setIndexFilteredMap(newIndexMap);
      setCourseUsers(filteredUsers);
    } else {
      setIndexFilteredMap([...Array(users.length).keys()]);
      setCourseUsers(users);
    }
    setValue('currentGroup', value);
  };

  const onFormSubmit = (data: DisbursementFormData): void => {
    setIsSubmitting(true);
    const newPointList = [] as PointListData[];
    const tempList = data.pointList.map(
      (pointData, index): PointListData => ({
        ...pointData,
        id: userIdMap[index],
      }),
    );
    indexFilteredMap.forEach((index) => newPointList.push(tempList[index]));
    if (
      (newPointList.filter((obj) => obj.points !== null || obj.points <= 0)
        .length ?? 0) === 0
    ) {
      toast.error(intl.formatMessage(translations.noDisbursement));
      setIsSubmitting(false);
    } else {
      const newData: DisbursementFormData = {
        ...data,
        pointList: newPointList,
      };

      dispatch(createDisbursement(newData))
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
          throw error;
        });
    }
  };

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
      className="points_awarded"
    />
  ));

  const onClickRemove = (): void => {
    indexFilteredMap.forEach((index) => update(index, { points: '' }));
  };

  const onClickCopy = (): void => {
    const first = watch('pointList')[indexFilteredMap[0]].points;
    indexFilteredMap.forEach((index) => update(index, { points: first ?? '' }));
  };

  return (
    <form
      encType="multipart/form-data"
      id="disbursement-form"
      noValidate
      onSubmit={handleSubmit((data) => {
        onFormSubmit(data);
      })}
    >
      <Paper
        elevation={3}
        sx={{
          padding: '5px 10px 8px 10px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#eeeeee',
          maxWidth: '400px',
        }}
      >
        <Controller
          name="currentGroup"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormSelectField
              className="filter-group"
              field={field}
              fieldState={fieldState}
              label={<FormattedMessage {...translations.filter} />}
              options={disbursementOptions}
              noneSelected={intl.formatMessage(translations.noneSelected)}
              onChangeCustom={onChangeFilter}
              margin="0px"
              shrink
              displayEmpty
            />
          )}
        />
      </Paper>
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
                enableDebouncing
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
        indexList={indexFilteredMap}
        filteredUsers={courseUsers}
        pointTextFieldArray={pointTextFieldArray}
        onClickRemove={onClickRemove}
        onClickCopy={onClickCopy}
      />
    </form>
  );
};

export default memo(
  injectIntl(DisbursementForm),
  (prevProps, nextProps) => prevProps.users.length === nextProps.users.length,
);
