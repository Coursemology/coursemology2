import { useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { change, Field, Form, formValueSelector, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Tab, Tabs } from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import { defineMessages, FormattedMessage } from 'react-intl';

import ErrorText, { errorProps } from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import TextField from 'lib/components/redux-form/TextField';

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

const isFieldBlank = (str) => str == null || str === '';

const validate = (values) => {
  const errors = {};
  const requiredFields = ['name'];

  requiredFields.forEach((field) => {
    if (isFieldBlank(values[field])) {
      errors[field] = formTranslations.required;
    }
  });

  if ((values.name?.length ?? 0) > 255) {
    errors.name = translations.nameLength;
  }

  const isSingle = values.is_single === true || values.is_single === 'true';

  if (!isSingle) {
    if (isFieldBlank(values.num_to_create)) {
      errors.num_to_create = formTranslations.required;
    } else {
      const numToCreate = Number.parseInt(values.num_to_create, 10);

      if (numToCreate < MIN_NUM_TO_CREATE) {
        errors.num_to_create = translations.numToCreateMin;
      }
      if (numToCreate > MAX_NUM_TO_CREATE) {
        errors.num_to_create = translations.numToCreateMax;
      }
    }
  }

  return errors;
};

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

const GroupCreationForm = ({
  dispatch,
  submitting,
  handleSubmit,
  onSubmit,
  isSingle,
  numToCreate,
  name,
  existingGroups,
  error,
}) => {
  useEffect(() => {
    dispatch(change(formNames.GROUP, 'is_single', true));
  }, []);

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

  const handleChange = useCallback(
    (event, value) =>
      dispatch(change(formNames.GROUP, 'is_single', value === 'is_single')),
    [dispatch],
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ErrorText errors={error} />
      <Tabs
        value={isSingle ? 'is_single' : 'is_multiple'}
        onChange={handleChange}
        variant="fullWidth"
      >
        <Tab label="Single" value="is_single" />
        <Tab label="Multiple" value="is_multiple" />
      </Tabs>
      {isSingle && (
        <div style={styles.flexCol}>
          <Field
            name="name"
            component={TextField}
            label={<FormattedMessage {...translations.name} />}
            disabled={submitting}
            style={styles.flexChild}
          />
          <Field
            name="description"
            component={TextField}
            label={<FormattedMessage {...translations.description} />}
            multiline
            disabled={submitting}
            rows={2}
            rowsMax={4}
            style={styles.flexChild}
          />
        </div>
      )}
      {!isSingle && (
        <div style={styles.flexCol}>
          <Field
            name="name"
            component={TextField}
            label={<FormattedMessage {...translations.prefix} />}
            disabled={submitting}
            style={styles.flexChild}
          />
          <Field
            name="num_to_create"
            component={TextField}
            label={<FormattedMessage {...translations.numToCreate} />}
            type="number"
            onWheel={(event) => event.currentTarget.blur()}
            disabled={submitting}
            style={styles.flexChild}
            min={MIN_NUM_TO_CREATE}
            max={MAX_NUM_TO_CREATE}
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
    </Form>
  );
};

GroupCreationForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  error: errorProps,
  isSingle: PropTypes.bool,
  numToCreate: PropTypes.number,
  name: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  existingGroups: PropTypes.arrayOf(groupShape).isRequired,
};

const formSelector = formValueSelector(formNames.GROUP);

export default connect((state) => ({
  isSingle: formSelector(state, 'is_single'),
  numToCreate: Number.parseInt(formSelector(state, 'num_to_create'), 10),
  name: formSelector(state, 'name'),
}))(
  reduxForm({
    form: formNames.GROUP,
    validate,
  })(GroupCreationForm),
);
