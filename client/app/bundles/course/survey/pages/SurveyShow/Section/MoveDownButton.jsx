import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { changeSectionOrder } from 'course/survey/actions/sections';

const translations = defineMessages({
  moveSectionDown: {
    id: 'course.survey.MoveDownButton.moveSectionDown',
    defaultMessage: 'Move Section Down',
  },
  success: {
    id: 'course.survey.MoveDownButton.success',
    defaultMessage: 'Section successfully moved down.',
  },
  failure: {
    id: 'course.survey.MoveDownButton.failure',
    defaultMessage: 'Failed to move section down.',
  },
});

class MoveDownButton extends Component {
  moveSectionDown = () => {
    const { dispatch, sectionIndex } = this.props;
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(
      changeSectionOrder(
        sectionIndex,
        sectionIndex + 1,
        successMessage,
        failureMessage,
      ),
    );
  };

  render() {
    return (
      <Button
        disabled={this.props.disabled}
        onClick={this.moveSectionDown}
        variant="outlined"
      >
        <FormattedMessage {...translations.moveSectionDown} />
      </Button>
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
