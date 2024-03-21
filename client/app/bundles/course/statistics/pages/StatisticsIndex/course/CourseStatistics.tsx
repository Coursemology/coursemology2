import { FC } from 'react';

import {
  fetchCoursePerformanceStatistics,
  fetchCourseProgressionStatistics,
} from 'course/statistics/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import StudentPerformanceTable from './StudentPerformanceTable';
import StudentProgressionChart from './StudentProgressionChart';

const CourseStatistics: FC = () => {
  return (
    <>
      <Preload
        render={<LoadingIndicator />}
        while={fetchCourseProgressionStatistics}
      >
        {(data) => (
          <StudentProgressionChart
            assessments={data.assessments}
            submissions={data.submissions}
          />
        )}
      </Preload>
      <Preload
        render={<LoadingIndicator />}
        while={fetchCoursePerformanceStatistics}
      >
        {(data) => {
          const {
            hasPersonalizedTimeline,
            isCourseGamified,
            showVideo,
            courseVideoCount,
            courseAssessmentCount,
            courseAchievementCount,
            maxLevel,
            hasGroupManagers,
          } = data.metadata;
          return (
            <StudentPerformanceTable
              courseAchievementCount={courseAchievementCount}
              courseAssessmentCount={courseAssessmentCount}
              courseVideoCount={courseVideoCount}
              hasGroupManagers={hasGroupManagers}
              hasPersonalizedTimeline={hasPersonalizedTimeline}
              isCourseGamified={isCourseGamified}
              maxLevel={maxLevel}
              showVideo={showVideo}
              students={data.students}
            />
          );
        }}
      </Preload>
    </>
  );
};

export default CourseStatistics;
