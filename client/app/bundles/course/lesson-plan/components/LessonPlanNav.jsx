import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import KeyboardArrowUp from 'material-ui/svg-icons/hardware/keyboard-arrow-up';
import { scroller, Helpers } from 'react-scroll';

const propTypes = {
  milestones: PropTypes.instanceOf(Immutable.List).isRequired,
  intl: intlShape.isRequired,
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
      text: props.intl.formatMessage(translations.goto),
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
   * Ideally, these scroll listeners should be mounted with the Popover MenuItems using
   * react-scroll's Link component. However, if we do that, the button text will not be
   * updated when the Popover Menu is closed, since the MenuItems (and hence the listeners)
   * will not be mounted. Instead, we mount it on empty dummy spans.
   */
  renderScrollSpies() {
    const { milestones } = this.props;
    const ScrollSpy = Helpers.Scroll('span'); // eslint-disable-line new-cap

    return (
      <span>
        {
          milestones.map(milestone => (
            <ScrollSpy
              spy
              key={milestone.get('id')}
              to={`milestone-group-${milestone.get('id')}`}
              onSetActive={() => { this.setState({ text: milestone.get('title') }); }}
              offset={-50}
            />
          ))
        }
      </span>
    );
  }

  renderNav() {
    const { milestones } = this.props;

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
              milestones.map(milestone => (
                <MenuItem
                  key={milestone.get('id')}
                  primaryText={milestone.get('title')}
                  onTouchTap={() => {
                    scroller.scrollTo(`milestone-group-${milestone.get('id')}`, {
                      offset: -50,
                    });
                    this.setState({
                      open: false,
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
