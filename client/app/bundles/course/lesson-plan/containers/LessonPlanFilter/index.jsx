import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import Done from 'material-ui/svg-icons/action/done';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import PropTypes from 'prop-types';

import { setItemTypeVisibility } from 'course/lesson-plan/actions';

const translations = defineMessages({
  filter: {
    id: 'course.lessonPlan.LessonPlanFilter.filter',
    defaultMessage: 'Filter',
  },
});

class LessonPlanFilter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const { dispatch, visibility } = this.props;
    const itemTypes = Object.keys(visibility);

    if (itemTypes.length < 1) {
      return null;
    }

    return (
      <>
        <RaisedButton
          icon={<KeyboardArrowUp />}
          label={<FormattedMessage {...translations.filter} />}
          labelPosition="before"
          onClick={this.handleClick}
          secondary={true}
        />
        <Popover
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
          open={this.state.open}
          targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Menu>
            {itemTypes.map((itemType) => {
              const isVisible = visibility[itemType];
              return (
                <MenuItem
                  key={itemType}
                  onClick={() =>
                    dispatch(setItemTypeVisibility(itemType, !isVisible))
                  }
                  primaryText={itemType}
                  rightIcon={isVisible ? <Done /> : <span />}
                />
              );
            })}
          </Menu>
        </Popover>
      </>
    );
  }
}

LessonPlanFilter.propTypes = {
  visibility: PropTypes.shape({}).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  visibility: state.lessonPlan.visibilityByType,
}))(LessonPlanFilter);
