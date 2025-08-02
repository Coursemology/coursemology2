import { defineMessage } from 'react-intl';

import ScholaisticFramePage from 'course/scholaistic/components/ScholaisticFramePage';

import { useLoader } from './loader';

const ScholaisticAssessmentSubmissionsIndex = (): JSX.Element => {
  const data = useLoader();

  return <ScholaisticFramePage src={data.embedSrc} />;
};

export const handle = defineMessage({ defaultMessage: 'Submissions' });

export default ScholaisticAssessmentSubmissionsIndex;
