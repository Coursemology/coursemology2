import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { scroller } from 'react-scroll';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { Button, MenuItem, MenuList, Popover } from '@mui/material';
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
        <Button
          color="secondary"
          endIcon={<KeyboardArrowUp />}
          onClick={this.handleClick}
          style={styles.navButton}
          variant="contained"
        >
          <FormattedMessage {...translations.goto} />
        </Button>
        <Popover
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
          onClose={this.handleRequestClose}
          open={this.state.open}
          transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <MenuList style={{ maxHeight: 450 }}>
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
                >
                  {group.milestone.title}
                </MenuItem>
              );
            })}
          </MenuList>
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

export default connect(({ lessonPlan }) => ({
  groups: lessonPlan.lessonPlan.groups,
}))(LessonPlanNav);
