import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import formTranslations from 'lib/translations/form';
import * as actions from '../actions';
import translations from './PopupDialog.intl';

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
    disabled: PropTypes.bool,
    visible: PropTypes.bool,
  };

  handleOpen = () => {
    this.props.dispatch({ type: actionTypes.ASSESSMENT_FORM_SHOW });
  };

  handleClose = () => {
  };

  render() {
    const formActions = [
      <FlatButton
        label={<FormattedMessage {...formTranslations.cancel} />}
        primary
        disabled={this.props.disabled}
      />,
      <FlatButton
        label={<FormattedMessage {...formTranslations.submit} />}
        primary
        disabled={this.props.disabled}
      />,
    ];

    const initialValues = {
      base_exp: 0,
      time_bonus_exp: 0,
      skippable: false,
      autograded: false,
      delayed_grade_publication: false,
    };
    const { intl } = this.props;

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
        />
      </div>
    );
  }
}

export default connect(state => state.formDialog)(injectIntl(PopupDialog));
