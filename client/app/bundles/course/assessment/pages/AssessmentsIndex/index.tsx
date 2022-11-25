import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tab, Tabs } from '@mui/material';
import { AssessmentsListData } from 'types/course/assessment/assessments';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import Preload from 'lib/components/wrappers/Preload';

import AssessmentsTable from './AssessmentsTable';
import NewAssessmentFormButton from './NewAssessmentFormButton';

const AssessmentsIndex = (): JSX.Element => {
  const [params, setParams] = useSearchParams();
  const [currentTab, setCurrentTab] =
    useState<AssessmentsListData['display']['tabId']>();

  const fetchAssessments = async (): Promise<AssessmentsListData> => {
    const categoryId = parseInt(params.get('category') ?? '', 10) || undefined;
    const tabId =
      currentTab ?? (parseInt(params.get('tab') ?? '', 10) || undefined);

    const response = await CourseAPI.assessment.assessments.index(
      categoryId,
      tabId,
    );

    return response.data as AssessmentsListData;
  };

  return (
    <Preload
      render={<LoadingIndicator />}
      syncsWith={[currentTab]}
      while={fetchAssessments}
    >
      {(data, refreshable): JSX.Element => (
        <>
          <PageHeader
            title={data.display.category.title}
            toolbars={
              data.display.canCreateAssessments
                ? [
                    <NewAssessmentFormButton
                      key={data.display.tabId}
                      // @ts-ignore: component is still written in JSX
                      categoryId={data.display.category.id}
                      gamified={data.display.gamified}
                      randomizationAllowed={data.display.randomization}
                      tabId={data.display.tabId}
                    />,
                  ]
                : undefined
            }
          />

          {data.display.category.tabs.length > 1 && (
            <Tabs
              className="sticky top-20 z-20 -mx-6 h-20 w-screen bg-cyan-50 sm:mx-0 sm:w-full sm:rounded-b-md"
              onChange={(_, id): void => {
                setCurrentTab(id);
                setParams({
                  category: data.display.category.id.toString(),
                  tab: id.toString(),
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              value={currentTab ?? data.display.tabId}
              variant="scrollable"
            >
              {data.display.category.tabs.map((tab) => (
                <Tab key={tab.id} label={tab.title} value={tab.id} />
              ))}
            </Tabs>
          )}

          {refreshable(
            <AssessmentsTable
              assessments={data}
              top={data.display.category.tabs.length > 1 ? 'top-40' : 'top-20'}
            />,
          )}
        </>
      )}
    </Preload>
  );
};

export default AssessmentsIndex;
