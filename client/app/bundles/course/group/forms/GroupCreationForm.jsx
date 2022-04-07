import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Tab, Tabs } from '@mui/material';
import { red } from '@mui/material/colors';
import { defineMessages, FormattedMessage } from 'react-intl';
import ErrorText from 'lib/components/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';
import actionTypes, { formNames } from '../constants';
import { groupShape } from '../propTypes';

const styles = {
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexChild: {
    width: '100%',
  },
  note: {
    marginTop: '1rem',
    fontSize: '1.5rem',
  },
  warning: {
    marginTop: '0.25rem',
    fontSize: '1.5rem',
    color: red[500],
  },
};

const translations = defineMessages({
  name: {
    id: 'course.group.groupForm.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.group.groupForm.description',
    defaultMessage: 'Description (Optional)',
  },
  nameLength: {
    id: 'course.group.groupForm.nameLength',
    defaultMessage: 'The name is too long!',
  },
  prefix: {
    id: 'course.group.groupForm.prefix',
    defaultMessage: 'Prefix',
  },
  numToCreate: {
    id: 'course.group.groupForm.numToCreate',
    defaultMessage: 'Number to Create',
  },
  numToCreateMin: {
    id: 'course.group.groupForm.numToCreateMin',
    defaultMessage: 'Minimum 2',
  },
  numToCreateMax: {
    id: 'course.group.groupForm.numToCreateMax',
    defaultMessage: 'Maximum 50',
  },
  multipleGroupsWillBeCreated: {
    id: 'course.group.groupForm.multipleGroupsWillBeCreated',
    defaultMessage: 'This will create groups {name} 1 to {name} {numToCreate}.',
  },
  duplicateGroups: {
    id: 'course.group.groupForm.duplicateGroups',
    defaultMessage:
      'The following group(s) already exist and will not be created again: {duplicateNames}.',
  },
});

const MIN_NUM_TO_CREATE = 2;
const MAX_NUM_TO_CREATE = 50;

const validationSchema = yup.object({
  name: yup
    .string()
    .required(formTranslations.required)
    .max(255, translations.nameLength),
  description: yup.string().nullable(),
  is_single: yup.bool(),
  num_to_create: yup
    .number()
    .nullable()
    .transform((v) => (v === '' || Number.isNaN(v) ? null : v))
    .when('is_single', {
      is: false,
      then: yup
        .number()
        .transform((v) => Number.parseInt(v, 10))
        .required(formTranslations.required)
        .typeError(formTranslations.required)
        .min(MIN_NUM_TO_CREATE, translations.numToCreateMin)
        .max(MAX_NUM_TO_CREATE, translations.numToCreateMax),
    }),
});

const getConflictingNames = (name, numToCreate, existingGroups) => {
  if (!name || !numToCreate) return [];
  const names = new Set();
  for (let i = 1; i <= Number.parseInt(numToCreate, 10); i += 1) {
    names.add(`${name} ${i}`);
  }
  return (
    existingGroups?.map((group) => group.name).filter((n) => names.has(n)) ?? []
  );
};

const GroupCreationForm = (props) => {
  const { dispatch, existingGroups, initialValues, onSubmit } = props;
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialValues,
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  const name = watch('name');
  const numToCreate = Number.parseInt(watch('num_to_create'), 10);
  const isSingle = watch('is_single');

  const conflictingNames = useMemo(
    () => getConflictingNames(name, numToCreate, existingGroups),
    [name, numToCreate, existingGroups],
  );

  useEffect(() => {
    if (!isSingle && numToCreate === conflictingNames.length) {
      dispatch({ type: actionTypes.SET_IS_DISABLED_TRUE });
    } else {
      dispatch({ type: actionTypes.SET_IS_DISABLED_FALSE });
    }
  }, [numToCreate, conflictingNames]);

  return (
    <form
      id={formNames.GROUP}
      noValidate
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
    >
      <ErrorText errors={errors} />
      <Tabs
        indicatorColor="primary"
        textColor="inherit"
        value={isSingle ? 'is_single' : 'is_multiple'}
        onChange={(event, value) =>
          setValue('is_single', value === 'is_single')
        }
        variant="fullWidth"
      >
        <Tab label="Single" value="is_single" />
        <Tab label="Multiple" value="is_multiple" />
      </Tabs>
      {isSingle && (
        <div style={styles.flexCol}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={isSubmitting}
                label={<FormattedMessage {...translations.name} />}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                renderIf={isSingle}
                required
                style={styles.flexChild}
                variant="standard"
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={isSubmitting}
                label={<FormattedMessage {...translations.description} />}
                fullWidth
                multiline
                InputLabelProps={{
                  shrink: true,
                }}
                minRows={2}
                maxRows={4}
                renderIf={isSingle}
                style={styles.flexChild}
                variant="standard"
              />
            )}
          />
        </div>
      )}
      {!isSingle && (
        <div style={styles.flexCol}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={isSubmitting}
                label={<FormattedMessage {...translations.prefix} />}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                renderIf={!isSingle}
                required
                style={styles.flexChild}
                variant="standard"
              />
            )}
          />
          <Controller
            name="num_to_create"
            control={control}
            render={({ field, fieldState }) => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={isSubmitting}
                fullWidth
                label={<FormattedMessage {...translations.numToCreate} />}
                InputProps={{
                  inputProps: {
                    min: MIN_NUM_TO_CREATE,
                    max: MAX_NUM_TO_CREATE,
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                onWheel={(event) => event.currentTarget.blur()}
                renderIf={!isSingle}
                style={styles.flexChild}
                type="number"
                variant="standard"
              />
            )}
          />
          {name &&
          numToCreate >= MIN_NUM_TO_CREATE &&
          numToCreate <= MAX_NUM_TO_CREATE ? (
            <div style={styles.note}>
              <FormattedMessage
                values={{ name, numToCreate }}
                {...translations.multipleGroupsWillBeCreated}
              />
            </div>
          ) : null}
          {conflictingNames.length > 0 ? (
            <div style={styles.warning}>
              <FormattedMessage
                values={{ duplicateNames: conflictingNames.join(', ') }}
                {...translations.duplicateGroups}
              />
            </div>
          ) : null}
        </div>
      )}
    </form>
  );
};

GroupCreationForm.propTypes = {
  existingGroups: PropTypes.arrayOf(groupShape).isRequired,
  dispatch: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default connect((state) => ({
  ...state.groupsDialog,
}))(GroupCreationForm);
