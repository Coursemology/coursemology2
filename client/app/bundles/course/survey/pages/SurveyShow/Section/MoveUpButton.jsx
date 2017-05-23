import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
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

class MoveUpButton extends React.Component {
  static propTypes = {
    sectionIndex: PropTypes.number.isRequired,
    disabled: PropTypes.bool,

    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    disabled: false,
  }

  moveSectionUp = () => {
    const { dispatch, sectionIndex } = this.props;
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(changeSectionOrder(sectionIndex, sectionIndex - 1, successMessage, failureMessage));
  }

  render() {
    return (
      <FlatButton
        label={<FormattedMessage {...translations.moveSectionUp} />}
        onTouchTap={this.moveSectionUp}
        disabled={this.props.disabled}
      />
    );
  }
}

export default connect()(MoveUpButton);
