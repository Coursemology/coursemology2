import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { scroller } from 'react-scroll';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import PropTypes from 'prop-types';

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

class LessonPlanNav extends Component {
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
    const { groups } = this.props;

    if (groups.length < 2) {
      return null;
    }

    return (
      <>
        <RaisedButton
          icon={<KeyboardArrowUp />}
          label={<FormattedMessage {...translations.goto} />}
          labelPosition="before"
          onClick={this.handleClick}
          secondary={true}
          style={styles.navButton}
        />
        <Popover
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
          open={this.state.open}
          targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <Menu maxHeight={450}>
            {groups.map((group) => {
              if (!group.milestone) {
                return null;
              }
              return (
                <MenuItem
                  key={group.id}
                  onClick={() => {
                    scroller.scrollTo(group.id, { offset: -50 });
                    this.setState({ open: false });
                  }}
                  primaryText={group.milestone.title}
                />
              );
            })}
          </Menu>
        </Popover>
      </>
    );
  }
}

LessonPlanNav.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
    }),
  ).isRequired,
};

export default connect((state) => ({
  groups: state.lessonPlan.groups,
}))(LessonPlanNav);
