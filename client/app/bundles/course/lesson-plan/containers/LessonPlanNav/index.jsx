import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { scroller, Helpers } from 'react-scroll';
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
      text: <FormattedMessage {...translations.goto} />,
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

  /**
   * Sets up ScrollSpies for each milestone group. Each scrollspy will update the nav button
   * text when the group it is spying on scrolls into view.
   *
   * Ideally, these scroll listeners should be mounted with the Popover MenuItems using
   * react-scroll's Link component. However, if we do that, the button text will not be
   * updated when the Popover Menu is closed, since the MenuItems (and hence the listeners)
   * will not be mounted. Instead, we mount it on empty dummy spans.
   */
  renderScrollSpies() {
    const { groups } = this.props;
    const ScrollSpy = Helpers.Scroll('span'); // eslint-disable-line new-cap

    return (
      <span>
        {
          groups.map((group) => {
            if (!group.milestone) { return null; }
            return (
              <ScrollSpy
                spy
                key={group.id}
                to={group.id}
                onSetActive={() => { this.setState({ text: group.milestone.title }); }}
                offset={-50}
              />
            );
          })
        }
      </span>
    );
  }

  render() {
    const { groups } = this.props;

    if (groups.length < 2) { return null; }

    return (
      <div>
        { this.renderScrollSpies() }
        <RaisedButton
          onTouchTap={this.handleTouchTap}
          label={this.state.text}
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
                    onTouchTap={() => {
                      scroller.scrollTo(group.id, { offset: -50 });
                      this.setState({ open: false });
                    }}
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
  groups: state.groups,
}))(LessonPlanNav);
