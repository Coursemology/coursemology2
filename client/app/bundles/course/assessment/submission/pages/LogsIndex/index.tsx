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
  const { t } = useTranslation();

  return (
    <Preload render={<LoadingIndicator />} while={fetchLogs}>
      {(data): JSX.Element => (
        <div className="space-y-5">
          <PageHeader
            returnLink={getAssessmentSubmissionURL(
              getCourseId(),
              getAssessmentId(),
            )}
            title={t(translations.accessLogs)}
          />
          <div>
            <LogsHead with={data.info} />
            <LogsContent with={data.logs} />
          </div>
        </div>
      )}
    </Preload>
  );
};

export default LogsIndex;
