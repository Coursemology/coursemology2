import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Done from 'material-ui/svg-icons/action/done';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import { setItemTypeVisibility } from 'course/lesson-plan/actions';

const translations = defineMessages({
  filter: {
    id: 'course.lessonPlan.LessonPlanFilter.filter',
    defaultMessage: 'Filter',
  },
});

class LessonPlanFilter extends React.Component {
  static propTypes = {
    visibility: PropTypes.shape().isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  }

  render() {
    const { dispatch, visibility } = this.props;
    const itemTypes = Object.keys(visibility);

    return (
      <div>
        <RaisedButton
          onTouchTap={this.handleTouchTap}
          label={<FormattedMessage {...translations.filter} />}
          labelPosition="before"
          icon={<KeyboardArrowUp />}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            {
              itemTypes.map((itemType) => {
                const isVisible = visibility[itemType];
                return (
                  <MenuItem
                    key={itemType}
                    primaryText={itemType}
                    rightIcon={isVisible ? <Done /> : <span />}
                    onTouchTap={() => dispatch(setItemTypeVisibility(itemType, !isVisible))}
                  />
                );
              })
            }
          </Menu>
        </Popover>
      </div>
    );
  }
}

export default connect(state => ({
  visibility: state.visibilityByType,
}))(LessonPlanFilter);
