import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { injectIntl, defineMessages } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import { scroller } from 'react-scroll';

const propTypes = {
  milestones: PropTypes.instanceOf(Immutable.List).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const translations = defineMessages({
  goto: {
    id: 'course.lessonPlan.lessonPlanFilter.goto',
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

    this.handleTouchTap = this.handleTouchTap.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  handleTouchTap(event) {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  renderNav() {
    const { milestones, intl } = this.props;

    return (
      <div>
        <RaisedButton
          onTouchTap={this.handleTouchTap}
          label={intl.formatMessage(translations.goto)}
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
              milestones.map(milestone => (
                <MenuItem
                  key={milestone.get('id')}
                  primaryText={milestone.get('title')}
                  onTouchTap={() => {
                    scroller.scrollTo(`milestone-group-${milestone.get('id')}`, {
                      offset: -50,
                    });
                  }}
                />
              ))
            }
          </Menu>
        </Popover>
      </div>
    );
  }

  render() {
    const { milestones } = this.props;

    if (milestones.size > 0) {
      return this.renderNav();
    }

    return <div />;
  }
}

LessonPlanNav.propTypes = propTypes;

export default injectIntl(LessonPlanNav);
