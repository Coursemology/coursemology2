import { PureComponent } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import MomentUtils from '@date-io/moment';
import { createTheme, MuiThemeProvider } from '@material-ui/core';
import {
  KeyboardDatePicker,
  KeyboardTimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateRange from 'material-ui/svg-icons/action/date-range';
import Schedule from 'material-ui/svg-icons/action/schedule';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import PropTypes from 'prop-types';

import moment from 'lib/moment';

const translations = defineMessages({
  datePlaceholder: {
    id: 'lib.components.form.DateTimePicker.datePlaceholder',
    defaultMessage: 'dd-mm-yyyy',
  },
  timePlaceholder: {
    id: 'lib.components.form.DateTimePicker.timePlaceholder',
    defaultMessage: 'hh:mm',
  },
  invalidDate: {
    id: 'lib.components.form.DateTimePicker.invalidDate',
    defaultMessage: 'Invalid date',
  },
  invalidTime: {
    id: 'lib.components.form.DateTimePicker.invalidTime',
    defaultMessage: 'Invalid time',
  },
});

const styleConstants = {
  dateFieldWidth: 145,
  timeFieldWidth: 130,
  iconWidth: 30,
  dateTimeGap: 5,
};

const styles = {
  dateTimePicker: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  dateTextField: {
    width: styleConstants.dateFieldWidth,
    marginRight: styleConstants.dateTimeGap,
  },
  timeTextField: {
    width: styleConstants.timeFieldWidth,
  },
  pickerIcon: {
    margins: 0,
    padding: 0,
    width: styleConstants.iconWidth,
  },
};

const datetimepickerTheme = createTheme({
  // https://material-ui.com/customization/themes/#typography---html-font-size
  // https://material-ui.com/style/typography/#migration-to-typography-v2
  typography: {
    htmlFontSize: 10,
    useNextVariants: true,
  },
  zIndex: {
    modal: 1800,
  },
});

const propTypes = {
  name: PropTypes.string.isRequired,
  floatingLabelText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.instanceOf(moment),
    PropTypes.string, // Date format from JSON string ( e.g. 2017-01-01T12:00:00+08:00 )
  ]),
  clearable: PropTypes.bool,
  errorText: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  intl: intlShape.isRequired,
  style: PropTypes.object,
};

class DateTimePicker extends PureComponent {
  static displayState(dateTime) {
    return {
      displayedDate: dateTime ? moment(dateTime).format('DD-MM-YYYY') : '',
      displayedTime: dateTime ? moment(dateTime).format('HH:mm') : '',
      dateError: '',
      timeError: '',
    };
  }

  constructor(props) {
    super(props);

    this.state = DateTimePicker.displayState(props.value);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const dateTime = nextProps.value;
    this.setState(DateTimePicker.displayState(dateTime));
  }

  updateDate = (newDate) => {
    if (newDate === null) {
      this.setState({ dateError: '' });
      this.updateDateTime(null);
      return;
    }
    const { date, months, years } = moment(newDate).toObject();
    const toCheck = [date, months, years];

    // We will only continue processing if date, months and years are ALL specified.
    // The reasons for this are:
    // - If the user is manually entering the date via keyboard, then until the user
    //   finishes typing the entire date, some of the fields above will be NaN.
    // - If we allow the above situation to proceed, this.props.value will be "corrupted"
    //   and become an invalid date.
    // - On the other hand, if we return early until all fields are specified, we will
    //   naturally obtain a valid date once all fields are here.
    // - Note that picking the date via the datepicker isn't affected, since all 3 fields
    //   will be specified for such a situation.
    if (!toCheck.every((num) => num != null && !Number.isNaN(num))) {
      // We will not clear the current datetime for now, since that will be very jarring
      // when the user deletes one character and the entire field resets to dd-mm-yyyy.
      this.setState({
        dateError: this.props.intl.formatMessage(translations.invalidDate),
      });
      return;
    }

    const newDateTime = this.props.value
      ? moment(this.props.value).set({ date, months, years })
      : moment({ date, months, years });
    this.setState({ dateError: '' });
    this.updateDateTime(newDateTime.toDate());
  };

  updateDateTime = (newDateTime) => {
    const { onBlur, onChange } = this.props;
    this.setState(DateTimePicker.displayState(newDateTime));
    // Marks redux-form field as 'touched' so that validation errors are shown, if any.
    if (onBlur) {
      onBlur();
    }
    if (onChange) {
      onChange(null, newDateTime);
    }
  };

  updateTime = (newTime) => {
    if (newTime === null) {
      // If there is already a date object, we don't want to just clear it, which
      // will be very disruptive if the user is also using the Date field, since
      // their date value will also just disappear.
      //
      // Instead, we will set it to 00:00.
      if (!this.props.value) {
        this.updateDateTime(null);
        return;
      }
      const resetDateTime = moment(this.props.value).set({
        hours: 0,
        minutes: 0,
      });
      this.updateDateTime(resetDateTime.toDate());
      return;
    }
    const { hours, minutes } = moment(newTime).toObject();
    const toCheck = [hours, minutes];

    // See comment under updateDate on rationale for early termination here.
    if (!toCheck.every((num) => num != null && !Number.isNaN(num))) {
      this.setState({
        timeError: this.props.intl.formatMessage(translations.invalidTime),
      });
      return;
    }

    const newDateTime = this.props.value
      ? moment(this.props.value).set({ hours, minutes })
      : moment({ hours, minutes });
    this.updateDateTime(newDateTime.toDate());
  };

  render() {
    const {
      intl,
      floatingLabelText,
      errorText,
      name,
      disabled,
      style,
      clearable,
    } = this.props;
    let value = this.props.value;
    // Convert string value to Date, which is expected by Date/TimePicker
    if (value && typeof value === 'string') {
      value = new Date(value);
    }

    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <MuiThemeProvider theme={datetimepickerTheme}>
          <div style={{ ...styles.dateTimePicker, ...style }}>
            <KeyboardDatePicker
              {...{ name, disabled }}
              clearable={clearable}
              error={!!errorText || !!this.state.dateError}
              format="DD-MM-YYYY"
              helperText={this.state.dateError || errorText}
              keyboardIcon={<DateRange style={styles.pickerIcon} />}
              label={floatingLabelText}
              leftArrowIcon={<KeyboardArrowLeft />}
              onChange={this.updateDate}
              placeholder={intl.formatMessage(translations.datePlaceholder)}
              rightArrowIcon={<KeyboardArrowRight />}
              // We want this component's error message to take priority over the parent's
              style={styles.dateTextField}
              value={value || null}
            />
            <KeyboardTimePicker
              {...{ name, disabled }}
              clearable={clearable}
              error={!!this.state.timeError}
              format="HH:mm"
              helperText={this.state.timeError}
              keyboard="true"
              keyboardIcon={<Schedule style={styles.pickerIcon} />}
              label="24-hr clock"
              onChange={this.updateTime}
              placeholder={intl.formatMessage(translations.timePlaceholder)}
              style={styles.timeTextField}
              value={value || null}
            />
          </div>
        </MuiThemeProvider>
      </MuiPickersUtilsProvider>
    );
  }
}

DateTimePicker.propTypes = propTypes;

export default injectIntl(DateTimePicker);
