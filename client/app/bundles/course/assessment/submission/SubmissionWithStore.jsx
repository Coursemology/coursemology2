import { StoreProviderWrapper } from 'lib/components/wrappers/ProviderWrapper';

import SubmissionRoutes from './containers/SubmissionRoutes';
import store from './store';

const SubmissionWithStore = () => (
  <StoreProviderWrapper store={store}>
    <SubmissionRoutes />
  </StoreProviderWrapper>
);

export default SubmissionWithStore;
