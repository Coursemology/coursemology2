import React from 'react';
import { mount } from 'enzyme';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from '../../../store';
import AchievementIndex from '../index';

describe('<AchievementIndex />', () => {
  it('renders the index page', async () => {
    const store = storeCreator({ achievements: {} });

    const indexPage = mount(
      <ProviderWrapper store={store}>
        <AchievementIndex badge={{ url: 'some-url.com' }} />
      </ProviderWrapper>
    );

    const newBtn = indexPage.find('button');
    newBtn.simulate('click');
    expect(indexPage.find('Dialog').first().props().open).toBe(true);
  });
});
