import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import CodaveriSettingsForm from './components/CodaveriSettingsForm';
import { fetchCodaveriSettings } from './operations';

const CodaveriSettings = (): JSX.Element => {
  return (
    <Preload render={<LoadingIndicator />} while={fetchCodaveriSettings}>
      {(data): JSX.Element => <CodaveriSettingsForm settings={data} />}
    </Preload>
  );
};

export default CodaveriSettings;
