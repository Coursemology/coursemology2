import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
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
        <Page
          backTo={getAssessmentSubmissionURL(getCourseId(), getAssessmentId())}
          title={t(translations.accessLogs)}
        >
          <LogsHead with={data.info} />
          <LogsContent with={data.logs} />
        </Page>
      )}
    </Preload>
  );
};

const handle = translations.accessLogs;

export default Object.assign(LogsIndex, { handle });
