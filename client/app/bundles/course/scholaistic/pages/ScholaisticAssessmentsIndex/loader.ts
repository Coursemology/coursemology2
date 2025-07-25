import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { ScholaisticAssessmentsIndexData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';
import { setHandleFromUrl } from 'course/scholaistic/handles';

export const loader: LoaderFunction = async ({
  request,
}): Promise<ScholaisticAssessmentsIndexData> => {
  const data = CourseAPI.scholaistic.fetchAssessments();

  setHandleFromUrl(request.url, 'Scholaistic Assessments');

  return {
    assessmentsTitle: 'Scholaistic Assessments',
    assessments: [
      {
        id: '1',
        title: 'ScholaisticAssessmentsIndexData',
        isStartTimeBegin: true,
        published: true,
        startAt: '2023-10-01T00:00:00Z',
        endAt: '2023-10-31T23:59:59Z',
        status: 'attempting',
        conditionSatisfied: true,
      },
      {
        id: '2',
        title: 'Another Assessment',
        isStartTimeBegin: false,
        published: false,
        startAt: '2023-11-01T00:00:00Z',
        endAt: '2023-11-30T23:59:59Z',
        status: 'open',
        conditionSatisfied: false,
      },
    ],
    display: {
      isGamified: true,
      isAchievementsEnabled: true,
      canEditAssessments: true,
      canCreateAssessments: true,
      canViewSubmissions: true,
      isStudent: false,
    },
  };
};

export const useLoader = (): ScholaisticAssessmentsIndexData =>
  useLoaderData() as ScholaisticAssessmentsIndexData;
