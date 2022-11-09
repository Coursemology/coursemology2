import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

import { duplicationModes } from 'course/duplication/constants';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

const translations = defineMessages({
  duplicateCourse: {
    id: 'course.duplication.DuplicateAllButton.duplicateCourse',
    defaultMessage: 'Duplicate Course',
  },
  info: {
    id: 'course.duplication.DuplicateAllButton.info',
    defaultMessage:
      'Duplication usually takes some time to complete. \
    You may close the window while duplication is in progress.\
    You will receive an email with a link to the new course when it becomes available.',
  },
  confirmationMessage: {
    id: 'course.duplication.DuplicateAllButton.confirmationMessage',
    defaultMessage: 'Proceed with course duplication?',
  },
});

const styles = {
  spinner: {
    position: 'absolute',
    marginLeft: 8,
  },
};

class DuplicateAllButton extends Component {
  constructor(props) {
    super(props);
    this.state = { confirmationOpen: false };
  }

  render() {
    const { duplicationMode, disabled, isDuplicating, isDuplicationSuccess } =
      this.props;
    if (duplicationMode !== duplicationModes.COURSE) {
      return null;
    }

    return (
      <>
        <div style={styles.buttonContainer}>
          <Button
            color="secondary"
            disabled={disabled}
            onClick={() => this.setState({ confirmationOpen: true })}
            variant="contained"
          >
            <FormattedMessage {...translations.duplicateCourse} />
          </Button>
          {(isDuplicating || isDuplicationSuccess) && (
            <CircularProgress size={36} style={styles.spinner} />
          )}
        </div>
        <ConfirmationDialog
          form="new-course-form"
          message={
            <>
              <FormattedMessage {...translations.info} />
              <br />
              <br />
              <FormattedMessage {...translations.confirmationMessage} />
            </>
          }
          onCancel={() => this.setState({ confirmationOpen: false })}
          onConfirm={() => {
            this.setState({ confirmationOpen: false });
          }}
          open={this.state.confirmationOpen}
        />
      </>
    );
  }
}

DuplicateAllButton.propTypes = {
  duplicationMode: PropTypes.string.isRequired,
  isDuplicating: PropTypes.bool.isRequired,
  isDuplicationSuccess: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
};

export default connect(({ duplication }) => ({
  duplicationMode: duplication.duplicationMode,
  isDuplicating: duplication.isDuplicating,
  isDuplicationSuccess: duplication.isDuplicationSuccess,
  disabled:
    duplication.isDuplicating ||
    duplication.isChangingCourse ||
    duplication.isDuplicationSuccess,
}))(DuplicateAllButton);
