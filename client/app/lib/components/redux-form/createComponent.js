import { Component, createElement } from 'react';
import { injectIntl } from 'react-intl';
/**
 * Creates a component class that renders the given Material UI component
 *
 * @param MaterialUIComponent The material ui component to render
 * @param mapProps A mapping of props provided by redux-form to the props the Material UI
 * component needs
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
