import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import moment from 'lib/moment';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import IconButton from 'material-ui/IconButton';
import DateRange from 'material-ui/svg-icons/action/date-range';
import Schedule from 'material-ui/svg-icons/action/schedule';
import formTranslations from 'lib/translations/form';

const translations = defineMessages({
  datePlaceholder: {
    id: 'lib.componenets.form.DateTimePicker.datePlaceholder',
    defaultMessage: 'dd-mm-yyyy',
  },
  timePlaceholder: {
    id: 'lib.componenets.form.DateTimePicker.timePlaceholder',
    defaultMessage: 'hh:mm',
  },
});

const styleConstants = {
  dateFieldWidth: 90,
  timeFieldWidth: 50,
  iconButtonWidth: 30,
  dateTimeGap: 5,
  labelLength: 270,
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
  },
  pickerIconButton: {
    padding: 0,
    width: styleConstants.iconButtonWidth,
  },
  label: {
    marginLeft: -styleConstants.iconButtonWidth,
    maxWidth: styleConstants.labelLength,
    width: styleConstants.labelLength,
  },
};

const propTypes = {
  name: PropTypes.string.isRequired,
  floatingLabelText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string, // Date format from JSON string ( e.g. 2017-01-01T12:00:00+08:00 )
  ]),
  errorText: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  intl: intlShape.isRequired,
  style: PropTypes.object,
};

class DateTimePicker extends React.Component {
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

  componentWillReceiveProps(nextProps) {
    const dateTime = nextProps.value;
    this.state = DateTimePicker.displayState(dateTime);
  }

  updateDateTime = (newDateTime) => {
    const { onBlur, onChange } = this.props;
    this.setState(DateTimePicker.displayState(newDateTime));
    // Marks redux-form field as 'touched' so that validation errors are shown, if any.
    if (onBlur) { onBlur(); }
    if (onChange) { onChange(null, newDateTime); }
  }

  updateDate = (_, newDate) => {
    const { date, months, years } = moment(newDate).toObject();
    const newDateTime = this.props.value ?
      moment(this.props.value).set({ date, months, years }) :
      moment({ date, months, years });
    this.updateDateTime(newDateTime.toDate());
  }

  updateTime = (_, newTime) => {
    const { hours, minutes } = moment(newTime).toObject();
    const newDateTime = this.props.value ?
      moment(this.props.value).set({ hours, minutes }) :
      moment({ hours, minutes });
    this.updateDateTime(newDateTime.toDate());
  }

  handleDateFieldBlur = () => {
    // Blanking out the date blanks out the whole field
    if (this.state.displayedDate === '') {
      this.updateDateTime(null, null);
      return;
    }

    const editedDate = moment(this.state.displayedDate, ['D-M-YYYY', 'D/M/YYYY'], true);
    if (editedDate.isValid()) {
      this.updateDate(null, editedDate.toDate());
    } else {
      this.setState({ dateError: this.props.intl.formatMessage(formTranslations.invalid) });
    }
  }

  handleTimeFieldBlur = () => {
    // Blanking out the time also blanks out the whole field
    if (this.state.displayedTime === '') {
      this.updateDateTime(null, null);
      return;
    }

    const editedTime = moment(this.state.displayedTime, 'H:mm', true);
    if (editedTime.isValid()) {
      this.updateTime(null, editedTime.toDate());
    } else {
      this.setState({ timeError: this.props.intl.formatMessage(formTranslations.invalid) });
    }
  }

  render() {
    const { intl, floatingLabelText, errorText, name, disabled, style } = this.props;
    let value = this.props.value;
    // Convert string value to Date, which is expected by Date/TimePicker
    if (value && typeof (value) === 'string') {
      value = new Date(value);
    }

    return (
      <div style={Object.assign({}, styles.dateTimePicker, style)}>
        <IconButton
          onTouchTap={() => !disabled && this.datePicker.openDialog()}
          style={styles.pickerIconButton}
        >
          <DateRange style={styles.pickerIcon} />
        </IconButton>
        <TextField
          {...{ name, floatingLabelText, disabled }}
          floatingLabelFixed
          floatingLabelStyle={styles.label}
          value={this.state.displayedDate}
          placeholder={intl.formatMessage(translations.datePlaceholder)}
          onChange={(_, date) => this.setState({ displayedDate: date })}
          onBlur={this.handleDateFieldBlur}
          style={styles.dateTextField}
          errorText={errorText || this.state.dateError}
        />
        <DatePicker
          {...{ name, disabled }}
          textFieldStyle={{ display: 'none' }}
          ref={input => (this.datePicker = input)}
          onChange={this.updateDate}
          value={value || undefined}
        />
        <IconButton
          onTouchTap={() => !disabled && this.timePicker.openDialog()}
          style={styles.pickerIconButton}
        >
          <Schedule style={styles.pickerIcon} />
        </IconButton>
        <TextField
          {...{ name, disabled }}
          value={this.state.displayedTime}
          placeholder={intl.formatMessage(translations.timePlaceholder)}
          floatingLabelFixed
          onChange={(_, time) => this.setState({ displayedTime: time })}
          onBlur={this.handleTimeFieldBlur}
          style={styles.timeTextField}
          errorText={this.state.timeError}
        />
        <TimePicker
          {...{ name, disabled }}
          textFieldStyle={{ display: 'none' }}
          ref={input => (this.timePicker = input)}
          onChange={this.updateTime}
          value={value || undefined}
        />
      </div>
    );
  }
}

DateTimePicker.propTypes = propTypes;

export default injectIntl(DateTimePicker);
