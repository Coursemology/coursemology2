import { render } from 'react-dom';

import initializeAjaxForms from 'lib/helpers/initializeAjaxForms';
import ProviderWrapper from 'lib/components/ProviderWrapper';

import UserStatistics from './pages/UserStatistics';
import storeCreator from './store';

initializeAjaxForms('tr.course-user #update');

$(() => {
  const userStatisticsMountNode = document.getElementById('user-statistics');

  if (userStatisticsMountNode) {
    const store = storeCreator({});

    render(
      <ProviderWrapper store={store}>
        <UserStatistics />
      </ProviderWrapper>,
      userStatisticsMountNode,
    );
  }
});
