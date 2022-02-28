import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { connect } from 'react-redux';
import { red } from '@material-ui/core/colors';
import Delete from '@material-ui/icons/Delete';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import actionTypes, { dialogTypes } from '../../constants';
import { deleteCategory, updateCategory } from '../../actions';
import { categoryShape } from '../../propTypes';
import GroupFormDialog from '../../forms/GroupFormDialog';
import NameDescriptionForm from '../../forms/NameDescriptionForm';
import GroupCard from '../../components/GroupCard';

const translations = defineMessages({
  updateSuccess: {
    id: 'course.group.show.categoryCard.update.success',
    defaultMessage: '{categoryName} was successfully updated.',
  },
  updateFailure: {
    id: 'course.group.show.categoryCard.update.fail',
    defaultMessage: 'Failed to update {categoryName}.',
  },
  deleteSuccess: {
    id: 'course.group.show.categoryCard.delete.success',
    defaultMessage: '{categoryName} was successfully deleted.',
  },
  deleteFailure: {
    id: 'course.group.show.categoryCard.delete.fail',
    defaultMessage: 'Failed to delete {categoryName}.',
  },
  edit: {
    id: 'course.group.show.categoryCard.edit',
    defaultMessage: 'Edit',
  },
  manage: {
    id: 'course.group.show.categoryCard.manage',
    defaultMessage: 'Manage Groups',
  },
  delete: {
    id: 'course.group.show.categoryCard.delete',
    defaultMessage: 'Delete Category',
  },
  confirmDelete: {
    id: 'course.group.show.categoryCard.confirmDelete',
    defaultMessage: 'Are you sure you wish to delete {categoryName}?',
  },
  subtitle: {
    id: 'course.group.show.categoryCard.subtitle',
    defaultMessage:
      '{numGroups} {numGroups, plural, one {group} other {groups}}',
  },
  noDescription: {
    id: 'course.group.show.categoryCard.noDescription',
    defaultMessage: 'No description available.',
  },
  dialogTitle: {
    id: 'course.group.show.categoryCard.dialogTitle',
    defaultMessage: 'Edit Category',
  },
});

const CategoryCard = ({
  category,
  numGroups,
  intl,
  onManageGroups,
  dispatch,
  canManageCategory,
  canManageGroups,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const onFormSubmit = useCallback(
    (data) => {
      if (!canManageCategory) {
        return undefined;
      }
      return dispatch(
        updateCategory(
          category.id,
          data,
          intl.formatMessage(translations.updateSuccess, {
            categoryName: category.name,
          }),
          intl.formatMessage(translations.updateFailure, {
            categoryName: category.name,
          }),
        ),
      );
    },
    [dispatch, category.id, category.name, canManageCategory],
  );

  const handleEdit = useCallback(() => {
    dispatch({ type: actionTypes.UPDATE_CATEGORY_FORM_SHOW });
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    if (!canManageCategory) {
      return undefined;
    }

    return dispatch(
      deleteCategory(
        category.id,
        intl.formatMessage(translations.deleteSuccess, {
          categoryName: category.name,
        }),
        intl.formatMessage(translations.deleteFailure, {
          categoryName: category.name,
        }),
      ),
    ).then(() => {
      setIsConfirmingDelete(false);
    });
  }, [
    dispatch,
    category.id,
    category.name,
    setIsConfirmingDelete,
    canManageCategory,
  ]);

  const bottomButtons = useMemo(() => {
    const result = [];
    if (canManageCategory) {
      result.push({
        label: <FormattedMessage {...translations.edit} />,
        onClick: handleEdit,
      });
    }
    if (canManageGroups) {
      result.push({
        label: <FormattedMessage {...translations.manage} />,
        onClick: onManageGroups,
      });
    }
    if (canManageCategory) {
      result.push({
        label: <FormattedMessage {...translations.delete} />,
        onClick: () => setIsConfirmingDelete(true),
        isRight: true,
        icon: <Delete nativeColor={red[500]} />,
      });
    }
    return result;
  }, [
    handleEdit,
    onManageGroups,
    setIsConfirmingDelete,
    canManageCategory,
    canManageGroups,
  ]);

  return (
    <>
      <GroupCard
        title={category.name}
        subtitle={
          <FormattedMessage values={{ numGroups }} {...translations.subtitle} />
        }
        bottomButtons={bottomButtons}
      >
        {category.description ?? (
          <FormattedMessage {...translations.noDescription} />
        )}
      </GroupCard>
      {canManageCategory && (
        <>
          <GroupFormDialog
            dialogTitle={intl.formatMessage(translations.dialogTitle)}
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
            message={intl.formatMessage(translations.confirmDelete, {
              categoryName: category.name,
            })}
          />
        </>
      )}
    </>
  );
};

CategoryCard.propTypes = {
  category: categoryShape.isRequired,
  dispatch: PropTypes.func.isRequired,
  numGroups: PropTypes.number.isRequired,
  onManageGroups: PropTypes.func.isRequired,
  canManageCategory: PropTypes.bool.isRequired,
  canManageGroups: PropTypes.bool.isRequired,
  intl: intlShape,
};

export default connect()(injectIntl(CategoryCard));
