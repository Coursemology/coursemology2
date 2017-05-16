import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { mount } from 'enzyme';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from '../../../store';
import AssessmentIndex from '../index';

// summernote does not work well with jsdom in tests, stub it to normal text field.
jest.mock('lib/components/redux-form/RichTextField', () => {
  const TextField = require.requireActual('lib/components/redux-form/TextField');
  return TextField;
});

describe('<AssessmentIndex />', () => {
  it('renders the index page', async () => {
    const store = storeCreator({ assessments: {} });

    const indexPage = mount(
      <ProviderWrapper store={store}>
        <AssessmentIndex categoryId={1} tabId={1} />
      </ProviderWrapper>
    );

    const newBtn = ReactDOM.findDOMNode(indexPage.find('button').node);
    ReactTestUtils.Simulate.touchTap(newBtn);
    expect(indexPage.find('Dialog').first().props().open).toBe(true);
  });
});
