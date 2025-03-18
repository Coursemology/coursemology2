import { useCallback, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import Delete from '@mui/icons-material/Delete';
import { red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { useAppDispatch } from 'lib/hooks/store';

import { deleteCategory, updateCategory } from '../../actions';
import GroupCard from '../../components/GroupCard';
import actionTypes, { dialogTypes } from '../../constants';
import GroupFormDialog from '../../forms/GroupFormDialog';
import NameDescriptionForm from '../../forms/NameDescriptionForm';
import { categoryShape } from '../../propTypes';

const translations = defineMessages({
  updateSuccess: {
    id: 'course.group.GroupShow.CategoryCard.updateSuccess',
    defaultMessage: '{categoryName} was successfully updated.',
  },
  updateFailure: {
    id: 'course.group.GroupShow.CategoryCard.updateFailure',
    defaultMessage: 'Failed to update {categoryName}.',
  },
  deleteSuccess: {
    id: 'course.group.GroupShow.CategoryCard.deleteSuccess',
    defaultMessage: '{categoryName} was successfully deleted.',
  },
  deleteFailure: {
    id: 'course.group.GroupShow.CategoryCard.deleteFailure',
    defaultMessage: 'Failed to delete {categoryName}.',
  },
  edit: {
    id: 'course.group.GroupShow.CategoryCard.edit',
    defaultMessage: 'Edit',
  },
  manage: {
    id: 'course.group.GroupShow.CategoryCard.manage',
    defaultMessage: 'Manage Groups',
  },
  delete: {
    id: 'course.group.GroupShow.CategoryCard.delete',
    defaultMessage: 'Delete Category',
  },
  confirmDelete: {
    id: 'course.group.GroupShow.CategoryCard.confirmDelete',
    defaultMessage: 'Are you sure you wish to delete {categoryName}?',
  },
  subtitle: {
    id: 'course.group.GroupShow.CategoryCard.subtitle',
    defaultMessage:
      '{numGroups} {numGroups, plural, one {group} other {groups}}',
  },
  noDescription: {
    id: 'course.group.GroupShow.CategoryCard.noDescription',
    defaultMessage: 'No description available.',
  },
  dialogTitle: {
    id: 'course.group.GroupShow.CategoryCard.dialogTitle',
    defaultMessage: 'Edit Category',
  },
});

const CategoryCard = ({
  category,
  numGroups,
  intl,
  onManageGroups,
  canManageCategory,
}) => {
  const dispatch = useAppDispatch();

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const onFormSubmit = useCallback(
    (data, setError) => {
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
          setError,
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
    if (canManageCategory) {
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
        icon: <Delete htmlColor={red[500]} />,
      });
    }
    return result;
  }, [handleEdit, onManageGroups, setIsConfirmingDelete, canManageCategory]);
  const [isDirty, setIsDirty] = useState(false);

  return (
    <>
      <GroupCard
        bottomButtons={bottomButtons}
        subtitle={
          <FormattedMessage values={{ numGroups }} {...translations.subtitle} />
        }
        title={category.name}
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
            skipConfirmation={!isDirty}
          >
            <NameDescriptionForm
              initialValues={{
                name: category.name,
                description: category.description,
              }}
              onDirtyChange={setIsDirty}
              onSubmit={onFormSubmit}
            />
          </GroupFormDialog>
          <ConfirmationDialog
            confirmDelete={isConfirmingDelete}
            confirmDiscard={!isConfirmingDelete}
            message={intl.formatMessage(translations.confirmDelete, {
              categoryName: category.name,
            })}
            onCancel={() => {
              setIsConfirmingDelete(false);
            }}
            onConfirm={() => {
              handleDelete();
            }}
            open={isConfirmingDelete}
          />
        </>
      )}
    </>
  );
};

CategoryCard.propTypes = {
  category: categoryShape.isRequired,
  numGroups: PropTypes.number.isRequired,
  onManageGroups: PropTypes.func.isRequired,
  canManageCategory: PropTypes.bool.isRequired,
  intl: PropTypes.object,
};

export default injectIntl(CategoryCard);
