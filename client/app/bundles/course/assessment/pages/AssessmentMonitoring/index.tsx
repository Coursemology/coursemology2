import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchMonitoringData } from '../../actions';

import PulseGrid from './PulseGrid';

const AssessmentMonitoring = (): JSX.Element => {
  return (
    <Preload render={<LoadingIndicator />} while={fetchMonitoringData}>
      {(data): JSX.Element => <PulseGrid with={data} />}
    </Preload>
  );
};

export default AssessmentMonitoring;
