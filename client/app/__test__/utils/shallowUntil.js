import { shallow } from 'enzyme';

// See https://github.com/airbnb/enzyme/issues/539 and the `until` helper was borrowed from there.
function until(selector, options) {
  let context = options && options.context;
  if (!selector || this.isEmptyRender() || typeof this.getElement().type === 'string') {
    return this;
  }

  const instance = this.getElement();
  if (instance.getChildContext) {
    context = {
      ...context,
      ...instance.getChildContext(),
    };
  }

  return this.is(selector)
    ? this.shallow({ context })
    : until.call(this.shallow({ context }), selector, { context });
}

/**
 * Shallow renders the component until the component matches the selector.
 * This is useful when the component you want to test is nested inside another component.
 * example:
 * ```
 * const component = <Provider>
 *                     <MyComponent />
 *                   </Provider>
 * ```
 * In the above case, `shallow(component)` will render the <Provider />, and
 * `shallowUntil(component, 'MyComponent')` will render <MyComponent />
 */
export default function shallowUntil(component, options, selector) {
  if (selector === undefined) {
    selector = options;
    options = undefined;
  }
  return until.call(shallow(component, options), selector, options);
}
