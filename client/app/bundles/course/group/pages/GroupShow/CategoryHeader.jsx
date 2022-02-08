import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
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
import GroupCard from '../../components/GroupCard';

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
    [dispatch, category.id, category.name],
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
  }, [dispatch, category.id, category.name, setIsConfirmingDelete]);

  const bottomButtons = useMemo(
    () => [
      {
        label: <FormattedMessage {...translations.editCategory} />,
        onClick: handleEdit,
      },
      {
        label: <FormattedMessage {...translations.manageGroups} />,
        onClick: onManageGroups,
      },
      {
        label: 'Delete Category',
        onClick: () => setIsConfirmingDelete(true),
        isRight: true,
        icon: <DeleteIcon color={red500} />,
      },
    ],
    [handleEdit, onManageGroups, setIsConfirmingDelete],
  );

  return (
    <>
      <GroupCard
        title={category.name}
        subtitle={
          <FormattedMessage
            values={{ numGroups }}
            {...translations.categoryHeaderSubtitle}
          />
        }
        bottomButtons={bottomButtons}
      >
        {category.description ?? (
          <FormattedMessage {...translations.noDescription} />
        )}
      </GroupCard>
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
