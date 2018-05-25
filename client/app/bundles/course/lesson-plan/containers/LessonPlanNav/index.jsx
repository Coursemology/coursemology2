import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { scroller } from 'react-scroll';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';

const translations = defineMessages({
  goto: {
    id: 'course.lessonPlan.LessonPlanNav.goto',
    defaultMessage: 'Go To Milestone',
  },
});

const styles = {
  navButton: {
    marginRight: 20,
  },
};

class LessonPlanNav extends React.Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
    })).isRequired,
  }

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
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  }

  render() {
    const { groups } = this.props;

    if (groups.length < 2) { return null; }

    return (
      <React.Fragment>
        <RaisedButton
          secondary
          onClick={this.handleClick}
          label={<FormattedMessage {...translations.goto} />}
          labelPosition="before"
          icon={<KeyboardArrowUp />}
          style={styles.navButton}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            {
              groups.map((group) => {
                if (!group.milestone) { return null; }
                return (
                  <MenuItem
                    key={group.id}
                    primaryText={group.milestone.title}
                    onClick={() => {
                      scroller.scrollTo(group.id, { offset: -50 });
                      this.setState({ open: false });
                    }}
                  />
                );
              })
            }
          </Menu>
        </Popover>
      </React.Fragment>
    );
  }
}

export default connect(state => ({
  groups: state.lessonPlan.groups,
}))(LessonPlanNav);
