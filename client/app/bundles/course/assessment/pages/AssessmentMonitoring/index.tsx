import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchMonitoringData } from '../../operations/monitoring';
import translations from '../../translations';

import PulseGrid from './PulseGrid';

const AssessmentMonitoring = (): JSX.Element => {
  return (
    <Preload render={<LoadingIndicator />} while={fetchMonitoringData}>
      {(data): JSX.Element => <PulseGrid with={data} />}
    </Preload>
  );
};

const handle = translations.pulsegrid;

export default Object.assign(AssessmentMonitoring, { handle });
