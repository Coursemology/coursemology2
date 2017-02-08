import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submit, isPristine } from 'redux-form';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import formTranslations from 'lib/translations/form';
import AssessmentForm from './AssessmentForm';
import * as actions from '../actions';
import translations from './PopupDialog.intl';
import actionTypes, { formNames } from '../constants';


const style = {
  fontSize: 14,
};

class PopupDialog extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape,
    courseId: PropTypes.number.isRequired,
    categoryId: PropTypes.number.isRequired,
    tabId: PropTypes.number.isRequired,
    pristine: PropTypes.bool,
    disabled: PropTypes.bool,
    visible: PropTypes.bool,
    confirmationDialogOpen: PropTypes.bool,
  };

  onFormSubmit = (data) => {
    const { courseId, categoryId, tabId } = this.props;
    this.props.dispatch(
      actions.createAssessment(courseId, categoryId, tabId, { assessment: data })
    );
  };

  handleOpen = () => {
    this.props.dispatch({ type: actionTypes.ASSESSMENT_FORM_SHOW });
  };

  handleClose = () => {
    this.props.dispatch({
      type: actionTypes.ASSESSMENT_FORM_CANCEL,
      payload: { pristine: this.props.pristine },
    });
  };

  render() {
    const { intl, dispatch } = this.props;

    const formActions = [
      <FlatButton
        label={<FormattedMessage {...formTranslations.cancel} />}
        primary
        disabled={this.props.disabled}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label={<FormattedMessage {...formTranslations.submit} />}
        className="btn-submit"
        primary
        onTouchTap={() => dispatch(submit(formNames.ASSESSMENT))}
        disabled={this.props.disabled}
      />,
    ];

    const initialValues = {
      base_exp: 0,
      time_bonus_exp: 0,
      skippable: false,
      autograded: false,
      delayed_grade_publication: false,
      tabbed_view: false,
    };

    return (
      <div>
        <RaisedButton
          label={intl.formatMessage(translations.new)}
          primary
          onTouchTap={this.handleOpen}
          style={style}
        />
        <Dialog
          title={intl.formatMessage(translations.newAssessment)}
          modal={false}
          open={this.props.visible}
          actions={formActions}
          onRequestClose={this.handleClose}
          autoScrollBodyContent
        >
          <AssessmentForm onSubmit={this.onFormSubmit} initialValues={initialValues} />
        </Dialog>
        <ConfirmationDialog
          confirmDiscard
          open={this.props.confirmationDialogOpen}
          onCancel={() => dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_CANCEL })}
          onConfirm={() => dispatch({ type: actionTypes.ASSESSMENT_FORM_CONFIRM_DISCARD })}
        />
      </div>
    );
  }
}

export default connect(state =>
   ({ ...state.formDialog, pristine: isPristine(formNames.ASSESSMENT)(state) })
)(injectIntl(PopupDialog));
