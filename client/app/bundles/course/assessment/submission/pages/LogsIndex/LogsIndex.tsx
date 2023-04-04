import { LogInfo } from 'types/course/assessment/submission/logs';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import Preload from 'lib/components/wrappers/Preload';
import { getAssessmentSubmissionURL } from 'lib/helpers/url-builders';
import { getAssessmentId, getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

import fetchLogs from '../../actions/logs';

import LogsContent from './LogsContent';
import LogsHead from './LogsHead';
import translations from './translations';

const LogsIndex = (): JSX.Element => {
  const fetchLogsData = (): Promise<LogInfo> => fetchLogs();

  const { t } = useTranslation();

  return (
    <Preload render={<LoadingIndicator />} while={fetchLogsData}>
      {(data): JSX.Element => {
        return (
          <>
            <PageHeader
              returnLink={getAssessmentSubmissionURL(
                getCourseId(),
                getAssessmentId(),
              )}
              title={t(translations.accessLogs)}
            />
            <div id="submission-log">
              <LogsHead with={data.info} />
              <LogsContent with={data.logs} />
            </div>
          </>
        );
      }}
    </Preload>
  );
};

export default LogsIndex;
