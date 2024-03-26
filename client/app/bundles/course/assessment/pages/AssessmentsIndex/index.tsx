import { useSearchParams } from 'react-router-dom';
import { Tab, Tabs } from '@mui/material';
import { AssessmentsListData } from 'types/course/assessment/assessments';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchAssessments } from '../../operations/assessments';

import AssessmentsTable from './AssessmentsTable';
import NewAssessmentFormButton from './NewAssessmentFormButton';

const AssessmentsIndex = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const categoryId = parseInt(params.get('category') ?? '', 10) || undefined;
  const tabId = parseInt(params.get('tab') ?? '', 10) || undefined;

  const fetchAssessmentsInTab = (): Promise<AssessmentsListData> => {
    return fetchAssessments(categoryId, tabId);
  };

  return (
    <Preload
      render={<LoadingIndicator />}
      syncsWith={[categoryId, tabId]}
      while={fetchAssessmentsInTab}
    >
      {(data, refreshable): JSX.Element => (
        <Page
          actions={
            data.display.canCreateAssessments && (
              <NewAssessmentFormButton
                key={data.display.tabId}
                // @ts-ignore: component is still written in JSX
                canManageMonitor={data.display.canManageMonitor}
                categoryId={data.display.category.id}
                gamified={data.display.isGamified}
                monitoringEnabled={data.display.isMonitoringEnabled}
                randomizationAllowed={data.display.allowRandomization}
                tabId={data.display.tabId}
              />
            )
          }
          title={data.display.category.title}
          unpadded
        >
          {data.display.category.tabs.length > 1 && (
            <Tabs
              className="sticky top-0 z-20 h-20 bg-white border-only-b-neutral-200"
              onChange={(_, id): void => {
                setParams({
                  category: data.display.category.id.toString(),
                  tab: id.toString(),
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              value={tabId ?? data.display.tabId}
              variant="scrollable"
            >
              {data.display.category.tabs.map((tab) => (
                <Tab key={tab.id} label={tab.title} value={tab.id} />
              ))}
            </Tabs>
          )}

          {refreshable(<AssessmentsTable assessments={data} />)}
        </Page>
      )}
    </Preload>
  );
};

export default AssessmentsIndex;
