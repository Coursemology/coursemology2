import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
  IconButton,
  RaisedButton,
} from 'material-ui';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import { red500 } from 'material-ui/styles/colors';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import translations from './translations.intl';
import actionTypes, { dialogTypes } from '../../constants';
import { deleteCategory, updateCategory } from '../../actions';
import { categoryShape } from '../../propTypes';
import GroupFormDialog from '../../forms/GroupFormDialog';
import NameDescriptionForm from '../../forms/NameDescriptionForm';

const styles = {
  card: {
    marginBottom: '2rem',
  },
  title: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  text: {
    paddingTop: 0,
  },
  actions: {
    padding: 16,
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonMarginRight: {
    marginRight: 16,
  },
};

const CategoryHeader = ({
  category,
  numGroups,
  intl,
  onManageGroups,
  dispatch,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const onFormSubmit = useCallback(
    (data) =>
      dispatch(
        updateCategory(
          category.id,
          data,
          intl.formatMessage(translations.updateCategorySuccess, {
            categoryName: category.name,
          }),
          intl.formatMessage(translations.updateCategoryFailure, {
            categoryName: category.name,
          }),
        ),
      ),
    [dispatch, updateCategory, category.id],
  );

  const handleEdit = useCallback(() => {
    dispatch({ type: actionTypes.UPDATE_CATEGORY_FORM_SHOW });
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(
      deleteCategory(
        category.id,
        intl.formatMessage(translations.deleteCategorySuccess, {
          categoryName: category.name,
        }),
        intl.formatMessage(translations.deleteCategoryFailure, {
          categoryName: category.name,
        }),
      ),
    ).then(() => {
      setIsConfirmingDelete(false);
    });
  });

  return (
    <>
      <Card style={styles.card}>
        <CardHeader
          title={<h3 style={styles.title}>{category.name}</h3>}
          subtitle={
            <FormattedMessage
              values={{ numGroups }}
              {...translations.categoryHeaderSubtitle}
            />
          }
        />
        <CardText style={styles.text}>
          {category.description ?? (
            <FormattedMessage {...translations.noDescription} />
          )}
        </CardText>
        <CardActions style={styles.actions}>
          <div>
            <RaisedButton
              primary
              label={<FormattedMessage {...translations.editCategory} />}
              onClick={handleEdit}
              style={styles.buttonMarginRight}
            />
            <RaisedButton
              primary
              label={<FormattedMessage {...translations.manageGroups} />}
              onClick={onManageGroups}
            />
          </div>
          <IconButton
            tooltip="Delete Category"
            onClick={() => setIsConfirmingDelete(true)}
          >
            <DeleteIcon color={red500} />
          </IconButton>
        </CardActions>
      </Card>
      <GroupFormDialog
        dialogTitle={intl.formatMessage(translations.editCategoryHeader)}
        expectedDialogTypes={[dialogTypes.UPDATE_CATEGORY]}
      >
        <NameDescriptionForm
          onSubmit={onFormSubmit}
          initialValues={{
            name: category.name,
            description: category.description,
          }}
        />
      </GroupFormDialog>
      <ConfirmationDialog
        confirmDiscard={!isConfirmingDelete}
        confirmDelete={isConfirmingDelete}
        open={isConfirmingDelete}
        onCancel={() => {
          setIsConfirmingDelete(false);
        }}
        onConfirm={() => {
          handleDelete();
        }}
      />
    </>
  );
};

CategoryHeader.propTypes = {
  category: categoryShape.isRequired,
  dispatch: PropTypes.func.isRequired,
  numGroups: PropTypes.number.isRequired,
  onManageGroups: PropTypes.func.isRequired,
  intl: intlShape,
};

export default connect()(injectIntl(CategoryHeader));
