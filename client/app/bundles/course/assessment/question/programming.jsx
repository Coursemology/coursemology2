import { render } from 'react-dom';
import Immutable from 'immutable';

import ProviderWrapper from 'lib/components/ProviderWrapper';

import ProgrammingQuestion from './programming/ProgrammingQuestion';
import storeCreator from './programming/store';

$(() => {
  const mountNode = document.getElementById('programming-question');
  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const props = Immutable.fromJS(JSON.parse(data));
    const store = storeCreator(props);

    const Page = () => (
      <ProviderWrapper {...{ store }}>
        <ProgrammingQuestion />
      </ProviderWrapper>
    );

    render(<Page />, mountNode);
  }
});
