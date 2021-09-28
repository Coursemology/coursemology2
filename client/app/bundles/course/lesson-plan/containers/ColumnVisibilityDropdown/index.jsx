import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Done from 'material-ui/svg-icons/action/done';
import KeyboardArrowDown from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
import { setColumnVisibility } from 'course/lesson-plan/actions';
import { fields } from 'course/lesson-plan/constants';
import fieldTranslations from 'course/lesson-plan/translations';

const { ITEM_TYPE, START_AT, BONUS_END_AT, END_AT, PUBLISHED } = fields;

const translations = defineMessages({
  label: {
    id: 'course.lessonPlan.ColumnVisibilityDropdown.label',
    defaultMessage: 'Toggle Column Visibility',
  },
});

const styles = {
  dropdown: {
    display: 'inline-block',
    marginLeft: 16,
  },
};

class ColumnVisibilityDropdown extends React.Component {
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
    const { dispatch, columnsVisible } = this.props;

    return (
      <div style={styles.dropdown}>
        <RaisedButton
          secondary
          onClick={this.handleClick}
          label={<FormattedMessage {...translations.label} />}
          labelPosition="before"
          icon={<KeyboardArrowDown />}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
        >
          <Menu>
            {[ITEM_TYPE, START_AT, BONUS_END_AT, END_AT, PUBLISHED].map(
              (field) => {
                const isVisible = columnsVisible[field];
                return (
                  <MenuItem
                    key={field}
                    primaryText={
                      <FormattedMessage {...fieldTranslations[field]} />
                    }
                    rightIcon={isVisible ? <Done /> : <span />}
                    onClick={() =>
                      dispatch(setColumnVisibility(field, !isVisible))
                    }
                  />
                );
              },
            )}
          </Menu>
        </Popover>
      </div>
    );
  }
}

ColumnVisibilityDropdown.propTypes = {
  columnsVisible: PropTypes.shape({}).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  columnsVisible: state.flags.editPageColumnsVisible,
}))(ColumnVisibilityDropdown);
