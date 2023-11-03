import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import AssessmentList from './components/AssessmentList';
import CodaveriSettingsForm from './components/forms/CodaveriSettingsForm';
import { fetchCodaveriSettings } from './operations';

const CodaveriSettings = (): JSX.Element => {
  return (
    <Preload render={<LoadingIndicator />} while={fetchCodaveriSettings}>
      {(data): JSX.Element => (
        <>
          <CodaveriSettingsForm settings={data} />
          <AssessmentList />
        </>
      )}
    </Preload>
  );
};

export default CodaveriSettings;
