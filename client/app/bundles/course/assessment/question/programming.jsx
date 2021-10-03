import { render } from 'react-dom';
import Immutable from 'immutable';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './programming/store';
import ProgrammingQuestion from './programming/ProgrammingQuestion';

$(document).ready(() => {
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
