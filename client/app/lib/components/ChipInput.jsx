import React from 'react';
import PropTypes from 'prop-types';
import TextFieldUnderline from 'material-ui/TextField/TextFieldUnderline';
import TextFieldHint from 'material-ui/TextField/TextFieldHint';
import TextFieldLabel from 'material-ui/TextField/TextFieldLabel';
import AutoComplete from 'material-ui/AutoComplete/AutoComplete';
import transitions from 'material-ui/styles/transitions';
import Chip from 'material-ui/Chip';
import { blue300 } from 'material-ui/styles/colors';

// This component is derived from https://github.com/TeamWertarbyte/material-ui-chip-input

const getStyles = (props, context, state) => {
  const {
    baseTheme,
    textField: {
      floatingLabelColor,
      focusColor,
      textColor,
      disabledTextColor,
      backgroundColor,
      errorColor,
    },
  } = context.muiTheme;

  const styles = {
    root: {
      fontSize: 16,
      lineHeight: '24px',
      width: props.fullWidth ? '100%' : 256,
      display: 'inline-block',
      position: 'relative',
      backgroundColor,
      fontFamily: baseTheme.fontFamily,
      transition: transitions.easeOut('200ms', 'height'),
      cursor: 'text',
    },
    input: {
      padding: 0,
      marginTop: 0,
      marginBottom: 24,
      lineHeight: '32px',
      height: 32,
      position: 'relative',
      display: 'inline-block',
      border: 'none',
      outline: 'none',
      backgroundColor: 'rgba(0,0,0,0)',
      color: props.disabled ? disabledTextColor : textColor,
      cursor: props.disabled ? 'not-allowed' : 'initial',
      font: 'inherit',
      appearance: 'none', // Remove border in Safari, doesn't seem to break anything in other browsers
      WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Remove mobile color flashing (deprecated style).
      float: 'left',
    },
    error: {
      position: 'absolute',
      bottom: -10,
      fontSize: 12,
      lineHeight: '12px',
      color: errorColor,
      transition: transitions.easeOut(),
    },
    floatingLabel: {
      color: props.disabled ? disabledTextColor : floatingLabelColor,
      pointerEvents: 'none',
      top: 28,
    },
    floatingLabelFocusStyle: {
      transform: 'scale(0.75) translate(0, -36px)',
    },
  };

  if (state.isFocused) {
    styles.floatingLabel.color = focusColor;
  }

  if (props.floatingLabelText) {
    styles.input.boxSizing = 'border-box';
  }

  if (state.errorText) {
    if (state.isFocused) {
      styles.floatingLabel.color = styles.error.color;
    }
  }

  return styles;
};

/* eslint-disable react/prop-types */
const defaultChipRenderer =
  ({ value, text, isFocused, isDisabled, handleClick, handleRequestDelete }, key) => (
    <Chip
      key={key}
      style={{
        margin: '8px 8px 0 0', float: 'left', pointerEvents: isDisabled ? 'none' : undefined }}
      backgroundColor={isFocused ? blue300 : null}
      onTouchTap={handleClick}
      onRequestDelete={handleRequestDelete}
    >
      {text}
    </Chip>
  );
/* eslint-enable react/prop-types */

const propTypes = {
  style: PropTypes.object,
  floatingLabelText: PropTypes.node,
  hintText: PropTypes.node,
  id: PropTypes.string,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataSourceConfig: PropTypes.shape({
    text: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  }),
  disabled: PropTypes.bool,
  value: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRequestAdd: PropTypes.func,
  onRequestDelete: PropTypes.func,
  onUpdateInput: PropTypes.func,
  openOnFocus: PropTypes.bool,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  filter: PropTypes.func,
  chipRenderer: PropTypes.func,
  newChipKeyCodes: PropTypes.arrayOf(PropTypes.number),
  clearOnBlur: PropTypes.bool,
  errorText: PropTypes.string,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  fullWidthInput: PropTypes.bool,
  menuStyle: PropTypes.object,
  hintStyle: PropTypes.object,
  errorStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  floatingLabelFixed: PropTypes.bool,
  floatingLabelFocusStyle: PropTypes.object,
  floatingLabelStyle: PropTypes.object,
  underlineShow: PropTypes.bool,
  underlineDisabledStyle: PropTypes.object,
  underlineFocusStyle: PropTypes.object,
  underlineStyle: PropTypes.object,
};

const defaultProps = {
  filter: AutoComplete.caseInsensitiveFilter,
  newChipKeyCodes: [13], // Enter
  clearOnBlur: true,
  underlineShow: true,
  openOnFocus: true,
  dataSourceConfig: { text: 'text', value: 'value' },
};

const contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};


class ChipInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
      errorText: undefined,
      isClean: true,
      chips: [],
      focusedChip: null,
      inputValue: '',
    };
  }

  componentWillMount() {
    this.setState({
      errorText: this.props.errorText,
    });
  }

  componentDidMount() {
    const handleKeyDown = this.autoComplete.handleKeyDown;
    this.autoComplete.handleKeyDown = (event) => {
      if (this.props.newChipKeyCodes.indexOf(event.keyCode) >= 0) {
        if (this.autoComplete.requestsList.length > 0) {
          const dataSource = this.autoComplete.props.dataSource;
          const child = this.autoComplete.requestsList[0].value;
          const index = parseInt(child.key, 10);
          const chosenRequest = dataSource[index];
          this.handleAddChip(chosenRequest);
        }
        this.autoComplete.setState({ searchText: '' });
        this.autoComplete.forceUpdate();
      } else {
        handleKeyDown(event);
      }
    };

    this.autoComplete.handleItemTouchTap = (event, child) => {
      const dataSource = this.autoComplete.props.dataSource;

      const index = parseInt(child.key, 10);
      const chosenRequest = dataSource[index];
      this.handleAddChip(chosenRequest);
      this.autoComplete.setState({ searchText: '' });
      this.autoComplete.forceUpdate();

      setTimeout(() => this.focus(), 100);
    };

    const handleEscKeyDown = this.autoComplete.handleEscKeyDown;
    this.autoComplete.handleEscKeyDown = () => {
      handleEscKeyDown();
      this.focus();
    };

    // force update autocomplete to ensure that it uses the new handlers
    this.autoComplete.forceUpdate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.disabled) {
      this.setState({ focusedChip: null });
    }
    if (nextProps.errorText !== this.props.errorText) {
      this.setState({
        errorText: nextProps.errorText,
      });
    }
  }

  getValue() {
    return this.input ? this.getInputNode().value : undefined;
  }

  getInputNode() {
    return this.autoComplete.refs.searchTextField.getInputNode();
  }

  blur() {
    if (this.input) this.getInputNode().blur();
  }

  focus() {
    if (this.props.disabled) return;
    if (this.autoComplete) {
      this.getInputNode().focus();
      if (this.props.openOnFocus) {
        this.autoComplete.setState({ open: true });
        this.autoComplete.forceUpdate();
      }
    }
    if (this.state.focusedChip) {
      this.setState({ focusedChip: null });
    }
  }

  select() {
    if (this.input) this.getInputNode().select();
  }

  handleInputBlur = (event) => {
    if (!this.autoComplete) return;
    setTimeout(() => {
      if (!this.autoComplete.state.open || this.autoComplete.requestsList.length === 0) {
        if (this.props.clearOnBlur) {
          this.setState({ inputValue: '' });
        }
        this.setState({ isFocused: false });
        if (this.props.onBlur) this.props.onBlur(event);
        this.blur();
      }
    }, 1);
  }

  handleInputFocus = (event) => {
    if (this.props.disabled) {
      return;
    }
    this.setState({ isFocused: true });
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 8 || event.keyCode === 46) { // Backspace and Delete
      if (event.target.value === '') {
        const chips = this.props.value;

        if (this.state.focusedChip == null && event.keyCode === 8) {
          this.setState({ focusedChip: chips[chips.length - 1] });
        } else if (this.state.focusedChip) {
          const index = chips.map(c => c[this.props.dataSourceConfig.value])
            .indexOf(this.state.focusedChip[this.props.dataSourceConfig.value]);
          const value = this.props.dataSourceConfig ?
            this.state.focusedChip[this.props.dataSourceConfig.value] : this.state.focusedChip;
          this.handleDeleteChip(value);
          if (event.keyCode === 8 && index > 0) {
            this.setState({ focusedChip: chips[index - 1] });
          } else if (event.keyCode === 46 && index < chips.length - 1) {
            this.setState({ focusedChip: chips[index + 1] });
          }
        }
      }
    } else if (event.keyCode === 37) { // Left
      const chips = this.props.value;

      if (this.state.focusedChip) {
        const index = chips.map(c => c[this.props.dataSourceConfig.value])
          .indexOf(this.state.focusedChip[this.props.dataSourceConfig.value]);
        if (index > 0) {
          this.setState({ focusedChip: chips[index - 1] });
        }
      } else {
        this.setState({ focusedChip: chips[chips.length - 1] });
      }
    } else if (event.keyCode === 39) { // Right
      const chips = this.props.value;

      if (this.state.focusedChip) {
        const index = chips.map(c => c[this.props.dataSourceConfig.value])
          .indexOf(this.state.focusedChip[this.props.dataSourceConfig.value]);
        if (index >= 0 && index < chips.length - 1) {
          this.setState({ focusedChip: chips[index + 1] });
        } else {
          this.setState({ focusedChip: null });
        }
      }
    } else {
      this.setState({ focusedChip: null });
    }
  }

  handleKeyUp = (event) => {
    if (this.props.newChipKeyCodes.indexOf(event.keyCode) < 0) {
      this.setState({ inputValue: event.target.value });
    } else {
      this.setState({ inputValue: '' });
    }
  }

  handleAddChip(chip) {
    this.autoComplete.setState({ searchText: '' });
    const chips = this.props.value;

    if (this.props.dataSourceConfig) {
      const valueKey = this.props.dataSourceConfig.value;
      const existingChip = chips.find(c => c[valueKey] === chip[valueKey]);
      const dataSourceEntry = this.props.dataSource.find(d => chip[valueKey] === d[valueKey]);

      if (!existingChip && dataSourceEntry) {
        if (this.props.onRequestAdd) {
          this.props.onRequestAdd(chip);
        }
      }
    } else if (chip.trim().length > 0) {
      if (chips.indexOf(chip) === -1) {
        if (this.props.onRequestAdd) {
          this.props.onRequestAdd(chip);
        }
      }
    }
  }

  handleDeleteChip(chip) {
    this.props.onRequestDelete(chip);
  }

  render() {
    const {
      className,
      dataSourceConfig,
      disabled,
      errorStyle,
      errorText, // eslint-disable-line no-unused-vars
      fullWidth,
      fullWidthInput,
      hintText,
      hintStyle,
      id,
      inputStyle,
      clearOnBlur, // eslint-disable-line no-unused-vars
      onBlur, // eslint-disable-line no-unused-vars
      onFocus, // eslint-disable-line no-unused-vars
      menuStyle,
      style,
      underlineDisabledStyle,
      underlineFocusStyle,
      underlineShow,
      underlineStyle,
      filter,
      value, // eslint-disable-line no-unused-vars
      dataSource,
      floatingLabelFixed,
      floatingLabelFocusStyle, // eslint-disable-line no-unused-vars
      floatingLabelStyle, // eslint-disable-line no-unused-vars
      floatingLabelText,
      onRequestAdd, // eslint-disable-line no-unused-vars
      onRequestDelete, // eslint-disable-line no-unused-vars
      chipRenderer = defaultChipRenderer,
      newChipKeyCodes, // eslint-disable-line no-unused-vars
      ...other
    } = this.props;

    const { prepareStyles } = this.context.muiTheme;
    const styles = getStyles(this.props, this.context, this.state);

    const inputProps = {
      id,
      ref: (elem) => { this.input = elem; },
      disabled: this.props.disabled,
      onBlur: this.handleInputBlur,
      onFocus: this.handleInputFocus,
      onKeyDown: this.handleKeyDown,
      fullWidth: !!fullWidthInput,
    };

    const inputStyleMerged = Object.assign(styles.input, inputStyle);

    const hasInput = this.props.value.length > 0 || this.state.inputValue.length > 0;
    const showHintText = hintText && !hasInput;
    const shrinkFloatingLabel = floatingLabelText &&
      (hasInput || this.state.isFocused || floatingLabelFixed);

    const errorTextElement = this.state.errorText && (
      <div style={prepareStyles(styles.error)}>{this.state.errorText}</div>
    );

    const floatingLabelTextElement = floatingLabelText && (
      <TextFieldLabel
        muiTheme={this.context.muiTheme}
        style={Object.assign(styles.floatingLabel, this.props.floatingLabelStyle)}
        shrinkStyle={
          Object.assign(styles.floatingLabelFocusStyle, this.props.floatingLabelFocusStyle)}
        htmlFor={id}
        shrink={shrinkFloatingLabel}
        disabled={disabled}
      >
        {floatingLabelText}
      </TextFieldLabel>
    );

    const overrideRootStyles = {};
    if (floatingLabelText) {
      overrideRootStyles.marginTop = 14;
    }
    if (fullWidth) {
      overrideRootStyles.width = '100%';
    }
    if (disabled) {
      overrideRootStyles.cursor = 'not-allowed';
    }

    const chips = this.props.value;
    const autoCompleteData = dataSourceConfig ?
      (dataSource || [])
        .filter(val => !chips.some(c => c[dataSourceConfig.value] === val[dataSourceConfig.value]))
      :
      (dataSource || []).filter(val => chips.indexOf(val) < 0);

    const actualFilter = other.openOnFocus ?
      (search, key) => (search === '' || filter(search, key)) : filter;

    return (
      <div
        className={className}
        style={prepareStyles(Object.assign(styles.root, style, overrideRootStyles))}
        onTouchTap={() => this.focus()}
      >
        <div>
          {floatingLabelTextElement}
          <div style={{ marginTop: floatingLabelText ? 12 : 0 }}>
            {chips.map((tag, i) => {
              const val = dataSourceConfig ? tag[dataSourceConfig.value] : tag;
              const focusedChip = this.state.focusedChip;
              const isFocused = focusedChip ?
                this.state.focusedChip[dataSourceConfig.value] === val : false;
              return chipRenderer({
                val,
                text: dataSourceConfig ? tag[dataSourceConfig.text] : tag,
                isDisabled: disabled,
                isFocused,
                handleClick: () => this.setState({ focusedChip: tag }),
                handleRequestDelete: () => this.handleDeleteChip(val),
              }, i);
            })}
          </div>
        </div>
        {hintText ?
          <TextFieldHint
            muiTheme={this.context.muiTheme}
            show={
              showHintText && !(floatingLabelText && !floatingLabelFixed && !this.state.isFocused)}
            style={Object.assign({ bottom: 20, pointerEvents: 'none' }, hintStyle)}
            text={hintText}
          /> :
          null
        }
        <AutoComplete
          {...other}
          {...inputProps}
          filter={actualFilter}
          style={inputStyleMerged}
          menuStyle={menuStyle}
          dataSource={autoCompleteData}
          dataSourceConfig={dataSourceConfig}
          searchText={this.state.inputValue}
          underlineShow={false}
          onKeyUp={this.handleKeyUp}
          ref={(ref) => { this.autoComplete = ref; }}
        />
        {underlineShow ?
          <TextFieldUnderline
            disabled={disabled}
            disabledStyle={underlineDisabledStyle}
            error={!!this.state.errorText}
            errorStyle={errorStyle}
            focus={this.state.isFocused}
            focusStyle={underlineFocusStyle}
            muiTheme={this.context.muiTheme}
            style={underlineStyle}
          /> :
          null
        }
        {errorTextElement}
      </div>
    );
  }
}

ChipInput.propTypes = propTypes;
ChipInput.defaultProps = defaultProps;
ChipInput.contextTypes = contextTypes;

export default ChipInput;
