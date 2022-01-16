import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
  Dialog,
  FlatButton,
  IconButton,
  RaisedButton,
} from 'material-ui';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { isPristine, submit } from 'redux-form';
import { connect } from 'react-redux';
import DeleteIcon from 'material-ui/svg-icons/action/delete';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import formTranslations from 'lib/translations/form';
import modalFormStyles from 'lib/styles/ModalForm.scss';

import { red500 } from 'material-ui/styles/colors';
import translations from './translations.intl';
import actionTypes, { formNames } from '../../constants';
import CategoryForm from '../components/CategoryForm';
import { deleteCategory, updateCategory } from '../../actions';

const styles = {
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
  id,
  name,
  description,
  numGroups,
  intl,
  isShown,
  isPristine: pristine,
  isConfirmationDialogOpen,
  isDisabled,
  dispatch,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const onFormSubmit = useCallback(
    (data) =>
      dispatch(
        updateCategory(
          id,
          data,
          intl.formatMessage(translations.updateCategorySuccess, {
            categoryName: name,
          }),
          intl.formatMessage(translations.updateCategoryFailure, {
            categoryName: name,
          }),
        ),
      ),
    [dispatch, updateCategory, id],
  );

  const handleEdit = useCallback(() => {
    dispatch({ type: actionTypes.UPDATE_CATEGORY_FORM_SHOW });
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch({
      type: actionTypes.UPDATE_CATEGORY_FORM_CANCEL,
      payload: { isPristine: pristine },
    });
  }, [dispatch, pristine]);

  const handleDelete = useCallback(() => {
    dispatch(
      deleteCategory(
        id,
        intl.formatMessage(translations.deleteCategorySuccess, {
          categoryName: name,
        }),
        intl.formatMessage(translations.deleteCategoryFailure, {
          categoryName: name,
        }),
      ),
    ).then(() => {
      setIsConfirmingDelete(false);
    });
  });

  const formActions = useMemo(
    () => [
      <FlatButton
        label={<FormattedMessage {...formTranslations.cancel} />}
        primary
        onClick={handleClose}
        disabled={isDisabled}
        key="update-group-category-popup-dialog-cancel-button"
      />,
      <FlatButton
        label={<FormattedMessage {...formTranslations.submit} />}
        className="btn-submit"
        primary
        onClick={() => dispatch(submit(formNames.GROUP_CATEGORY))}
        disabled={isDisabled}
        key="update-group-category-popup-dialog-submit-button"
      />,
    ],
    [handleClose],
  );

  return (
    <>
      <Card>
        <CardHeader
          title={<h3 style={styles.title}>{name}</h3>}
          subtitle={
            <FormattedMessage
              values={{ numGroups }}
              {...translations.categoryHeaderSubtitle}
            />
          }
        />
        <CardText style={styles.text}>
          {description ?? <FormattedMessage {...translations.noDescription} />}
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
      <Dialog
        title={intl.formatMessage(translations.editCategoryHeader)}
        modal={false}
        open={isShown}
        actions={formActions}
        onRequestClose={handleClose}
        autoScrollBodyContent
        contentStyle={styles.dialog}
        bodyClassName={modalFormStyles.modalForm}
      >
        <CategoryForm
          onSubmit={onFormSubmit}
          initialValues={{ name, description }}
        />
      </Dialog>
      <ConfirmationDialog
        confirmDiscard={!isConfirmingDelete}
        confirmDelete={isConfirmingDelete}
        open={isConfirmationDialogOpen || isConfirmingDelete}
        onCancel={() => {
          if (isConfirmingDelete) {
            setIsConfirmingDelete(false);
            return;
          }
          dispatch({ type: actionTypes.UPDATE_CATEGORY_FORM_CONFIRM_CANCEL });
        }}
        onConfirm={() => {
          if (isConfirmingDelete) {
            handleDelete();
            return;
          }
          dispatch({ type: actionTypes.UPDATE_CATEGORY_FORM_CONFIRM_DISCARD });
        }}
      />
    </>
  );
};

CategoryHeader.propTypes = {
  id: PropTypes.oneOf([PropTypes.number, PropTypes.string]).isRequired,
  dispatch: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  numGroups: PropTypes.number.isRequired,
  isPristine: PropTypes.bool,
  isShown: PropTypes.bool.isRequired,
  isConfirmationDialogOpen: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  intl: intlShape,
};

export default connect((state) => ({
  isShown: state.groupsDialog.isUpdateDialogShown,
  isConfirmationDialogOpen: state.groupsDialog.isUpdateConfirmationDialogOpen,
  isDisabled: state.groupsDialog.isDisabled,
  isPristine: isPristine(formNames.GROUP_CATEGORY)(state),
}))(injectIntl(CategoryHeader));
