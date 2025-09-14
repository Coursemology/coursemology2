import { CodaveriSettingsEntity } from 'types/course/admin/codaveri';
import { CourseInfo } from 'types/course/admin/course';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchCourseSettings } from '../CourseSettings/operations';

import AssessmentList from './components/AssessmentList';
import CodaveriSettingsForm from './components/forms/CodaveriSettingsForm';
import { fetchCodaveriSettings } from './operations';

const CodaveriSettings = (): JSX.Element => {
  const fetchCourseAndCodaveriSettings = (): Promise<
    [CourseInfo, CodaveriSettingsEntity]
  > => Promise.all([fetchCourseSettings(), fetchCodaveriSettings()]);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchCourseAndCodaveriSettings}
    >
      {([courseData, codaveriData]): JSX.Element => (
        <>
          <CodaveriSettingsForm
            availableModels={codaveriData.adminSettings?.availableModels ?? []}
            settings={codaveriData}
          />
          <AssessmentList courseTitle={courseData.title} />
        </>
      )}
    </Preload>
  );
};

export default CodaveriSettings;
