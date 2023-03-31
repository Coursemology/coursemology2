import { LogsInfo } from 'types/course/assessment/submission/logs';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import fetchLogs from '../../actions/logs';

import LogsContent from './LogsContent';
import LogsHead from './LogsHead';

const LogsIndex = (): JSX.Element => {
  const fetchLogsData = (): Promise<LogsInfo> => fetchLogs();

  return (
    <Preload render={<LoadingIndicator />} while={fetchLogsData}>
      {(data): JSX.Element => {
        return (
          <>
            <LogsHead with={data.log.info} />
            <LogsContent with={data.log.logs} />
          </>
        );
      }}
    </Preload>
  );
};

export default LogsIndex;
