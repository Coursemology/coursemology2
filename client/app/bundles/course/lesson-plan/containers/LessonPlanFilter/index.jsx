import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button, MenuItem, MenuList, Popover } from '@material-ui/core';
import Done from '@material-ui/icons/Done';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
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
        <Button
          variant="contained"
          color="secondary"
          onClick={this.handleClick}
        >
          <FormattedMessage {...translations.filter} />
          <KeyboardArrowUp />
        </Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          onClose={this.handleRequestClose}
          transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuList>
            {itemTypes.map((itemType) => {
              const isVisible = visibility[itemType];
              return (
                <MenuItem
                  key={itemType}
                  onClick={() =>
                    dispatch(setItemTypeVisibility(itemType, !isVisible))
                  }
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  {itemType}
                  {isVisible && <Done />}
                </MenuItem>
              );
            })}
          </MenuList>
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
