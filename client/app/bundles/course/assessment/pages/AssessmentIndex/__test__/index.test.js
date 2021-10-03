import { mount } from 'enzyme';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from '../../../store';
import AssessmentIndex from '../index';

describe('<AssessmentIndex />', () => {
  it('renders the index page', async () => {
    const store = storeCreator({ assessments: {} });

    const indexPage = mount(
      <ProviderWrapper store={store}>
        <AssessmentIndex categoryId={1} tabId={1} />
      </ProviderWrapper>,
    );

    const newBtn = indexPage.find('button');
    newBtn.simulate('click');
    expect(indexPage.find('Dialog').first().props().open).toBe(true);
  });
});
