import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit, isValid } from 'redux-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { formNames, duplicationModes } from 'course/duplication/constants';

const translations = defineMessages({
  duplicateCourse: {
    id: 'course.duplication.DuplicateAllButton.duplicateCourse',
    defaultMessage: 'Duplicate Course',
  },
  info: {
    id: 'course.duplication.DuplicateAllButton.info',
    defaultMessage: 'Duplication usually takes some time to complete. \
    You may close the window while duplication is in progress.\
    You will receive an email with a link to the new course when it becomes available.',
  },
  confirmationMessage: {
    id: 'course.duplication.DuplicateAllButton.confirmationMessage',
    defaultMessage: 'Proceed with course duplication?',
  },
});

class DuplicateAllButton extends React.Component {
  static propTypes = {
    duplicationMode: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,

    dispatch: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { confirmationOpen: false };
  }

  render() {
    const { dispatch, duplicationMode, disabled } = this.props;

    if (duplicationMode !== duplicationModes.COURSE) { return null; }

    return (
      <React.Fragment>
        <RaisedButton
          secondary
          disabled={disabled}
          label={<FormattedMessage {...translations.duplicateCourse} />}
          onClick={() => this.setState({ confirmationOpen: true })}
        />
        <ConfirmationDialog
          open={this.state.confirmationOpen}
          message={
            <React.Fragment>
              <FormattedMessage {...translations.info} />
              <br /><br />
              <FormattedMessage {...translations.confirmationMessage} />
            </React.Fragment>
          }
          onCancel={() => this.setState({ confirmationOpen: false })}
          onConfirm={() => {
            dispatch(submit(formNames.NEW_COURSE));
            this.setState({ confirmationOpen: false });
          }}
        />
      </React.Fragment>
    );
  }
}

export default connect(({ duplication, ...state }) => ({
  duplicationMode: duplication.duplicationMode,
  disabled: !isValid(formNames.NEW_COURSE)(state) ||
            duplication.isDuplicating ||
            duplication.isChangingCourse,
}))(DuplicateAllButton);
