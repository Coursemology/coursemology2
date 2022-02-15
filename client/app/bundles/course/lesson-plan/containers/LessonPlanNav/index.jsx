import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { scroller } from 'react-scroll';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { Button } from '@material-ui/core';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';

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
        <Button
          variant="contained"
          color="secondary"
          onClick={this.handleClick}
          style={styles.navButton}
        >
          <FormattedMessage {...translations.goto} />
          <KeyboardArrowUp />
        </Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu maxHeight={450}>
            {groups.map((group) => {
              if (!group.milestone) {
                return null;
              }
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
