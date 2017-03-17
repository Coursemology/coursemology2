import { Component, createElement } from 'react';
import { injectIntl } from 'react-intl';
/**
 * Creates a component class that renders the given Material UI component
 *
 * @param {React.Component} MaterialUIComponent The material ui component to render
 * @param {function} mapProps A function that maps props provided by redux-form to the props the
 * Material UI component needs.
 * Format of the redux-from props (input of the mapProps function):
 * {
 *   input: {name: stirng, value: any, onChange: function, ...},
 *   meta: {touched: boolean, pristine: boolean, error: string, ...}
 *   otherProps: {}  // Other props that passed to the <Field /> input: label, intl, etc...
 * }
 * See http://redux-form.com/6.5.0/docs/api/Field.md/ for the detailed props.
 */
export default function createComponent(MaterialUIComponent, mapProps) {
  class InputComponent extends Component {
    getRenderedComponent() {
      return this.component;
    }

    render() {
      return createElement(MaterialUIComponent, {
        ...mapProps(this.props),
        ref: component => (this.component = component),
      });
    }
  }
  InputComponent.displayName = `ReduxFormMaterialUI${MaterialUIComponent.name}`;
  return injectIntl(InputComponent);
}
