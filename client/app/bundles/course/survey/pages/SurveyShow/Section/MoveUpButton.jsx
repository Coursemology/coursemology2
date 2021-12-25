import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';

import { changeSectionOrder } from 'course/survey/actions/sections';

const translations = defineMessages({
  moveSectionUp: {
    id: 'course.surveys.MoveUpButton.moveSectionUp',
    defaultMessage: 'Move Section Up',
  },
  success: {
    id: 'course.surveys.MoveUpButton.success',
    defaultMessage: 'Section successfully moved up.',
  },
  failure: {
    id: 'course.surveys.MoveUpButton.failure',
    defaultMessage: 'Failed to move section up.',
  },
});

class MoveUpButton extends Component {
  moveSectionUp = () => {
    const { dispatch, sectionIndex } = this.props;
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(
      changeSectionOrder(
        sectionIndex,
        sectionIndex - 1,
        successMessage,
        failureMessage,
      ),
    );
  };

  render() {
    return (
      <FlatButton
        disabled={this.props.disabled}
        label={<FormattedMessage {...translations.moveSectionUp} />}
        onClick={this.moveSectionUp}
      />
    );
  }
}

MoveUpButton.propTypes = {
  sectionIndex: PropTypes.number.isRequired,
  disabled: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
};

MoveUpButton.defaultProps = {
  disabled: false,
};

export default connect()(MoveUpButton);
