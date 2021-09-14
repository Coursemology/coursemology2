import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import { changeSectionOrder } from 'course/survey/actions/sections';

const translations = defineMessages({
  moveSectionDown: {
    id: 'course.surveys.MoveDownButton.moveSectionDown',
    defaultMessage: 'Move Section Down',
  },
  success: {
    id: 'course.surveys.MoveDownButton.success',
    defaultMessage: 'Section successfully moved down.',
  },
  failure: {
    id: 'course.surveys.MoveDownButton.failure',
    defaultMessage: 'Failed to move section down.',
  },
});

class MoveDownButton extends React.Component {
  moveSectionDown = () => {
    const { dispatch, sectionIndex } = this.props;
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(
      changeSectionOrder(
        sectionIndex,
        sectionIndex + 1,
        successMessage,
        failureMessage
      )
    );
  };

  render() {
    return (
      <FlatButton
        label={<FormattedMessage {...translations.moveSectionDown} />}
        onClick={this.moveSectionDown}
        disabled={this.props.disabled}
      />
    );
  }
}

MoveDownButton.propTypes = {
  sectionIndex: PropTypes.number.isRequired,
  disabled: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
};

MoveDownButton.defaultProps = {
  disabled: false,
};

export default connect()(MoveDownButton);
