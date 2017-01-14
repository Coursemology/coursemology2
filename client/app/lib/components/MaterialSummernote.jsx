import React, { PropTypes } from 'react';
import ReactSummernote from 'react-summernote';
import TextFieldLabel from 'material-ui/TextField/TextFieldLabel';

import '../styles/MaterialSummernote.scss';

const propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  inputId: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
};

const contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

class MaterialSummernote extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isFocused: false };
  }

  render() {
    const {
      baseTheme,
      textField: {
        focusColor,
        floatingLabelColor,
        disabledTextColor,
        backgroundColor,
      },
    } = this.context.muiTheme;

    const testFieldLabelColor = this.state.isFocused ? focusColor : floatingLabelColor;

    return (
      <div
        key={this.props.field}
        style={{
          fontSize: 16,
          width: '100%',
          display: 'inline-block',
          position: 'relative',
          backgroundColor,
          fontFamily: baseTheme.fontFamily,
          cursor: this.props.disabled ? 'not-allowed' : 'auto',
          paddingTop: '2.5em',
        }}
      >
        <TextFieldLabel
          muiTheme={this.context.muiTheme}
          style={{
            pointerEvents: 'none',
            color: this.props.disabled ? disabledTextColor : testFieldLabelColor,
          }}
          htmlFor={this.props.field}
          shrink
          disabled={this.props.disabled}
        >
          {this.props.label}
        </TextFieldLabel>
        <textarea
          name={this.props.name}
          id={this.props.inputId}
          required={this.props.required}
          value={this.props.value}
          style={{ display: 'none' }}
          onChange={(e) => { this.props.onChange(e.target.value); }}
          disabled={this.props.disabled}
        />
        <div className="material-summernote">
          <ReactSummernote
            options={{ dialogsInBody: false, disabled: this.props.disabled }}
            value={this.props.value}
            onChange={this.props.onChange}
            onFocus={() => { this.setState({ isFocused: true }); }}
            onBlur={() => { this.setState({ isFocused: false }); }}
          />
        </div>
      </div>
    );
  }
}

MaterialSummernote.propTypes = propTypes;
MaterialSummernote.contextTypes = contextTypes;

export default MaterialSummernote;
