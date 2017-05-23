import React from 'react';
import PropTypes from 'prop-types';
import shallowUntil from '../shallowUntil';

describe('#shallowUntil', () => {
  const Div = () => <div />;
  const hoc = Component => () => <Component />;

  it('shallow renders the current wrapper one level deep', () => {
    const EnhancedDiv = hoc(Div);
    const wrapper = shallowUntil(<EnhancedDiv />, 'Div');
    expect(wrapper.contains(<div />)).toBeTruthy();
  });

  it('shallow renders the current wrapper several levels deep', () => {
    const EnhancedDiv = hoc(hoc(hoc(Div)));
    const wrapper = shallowUntil(<EnhancedDiv />, 'Div');
    expect(wrapper.contains(<div />)).toBeTruthy();
  });

  it('shallow renders the current wrapper even if the selector never matches', () => {
    const EnhancedDiv = hoc(Div);
    const wrapper = shallowUntil(<EnhancedDiv />, 'NotDiv');
    expect(wrapper.contains(<div />)).toBeTruthy();
  });

  it('stops shallow rendering when it encounters a DOM element', () => {
    const wrapper = shallowUntil(<div><Div /></div>, 'Div');
    expect(wrapper.contains(<div><Div /></div>)).toBeTruthy();
  });

  describe('with context', () => {
    const Foo = () => <Div />;
    Foo.contextTypes = { open: PropTypes.bool.isRequired };

    class Bar extends React.Component {
      static childContextTypes = { open: PropTypes.bool }
      getChildContext = () => ({ open: true })
      render = () => <Foo />
    }

    it('passes down context from the root component', () => {
      const EnhancedFoo = hoc(Foo);
      const wrapper = shallowUntil(<EnhancedFoo />, { context: { open: true } }, 'Foo');
      expect(wrapper.context('open')).toEqual(true);
      expect(wrapper.contains(<Div />)).toBeTruthy();
    });

    it('passes down context from an intermediary component', () => {
      const EnhancedBar = hoc(Bar);
      const wrapper = shallowUntil(<EnhancedBar />, 'Foo');
      expect(wrapper.context('open')).toEqual(true);
      expect(wrapper.contains(<Div />)).toBeTruthy();
    });
  });
});
