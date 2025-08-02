import ScholaisticFramePage from 'course/scholaistic/components/ScholaisticFramePage';

import { useLoader } from './loader';

const ScholaisticAssessmentView = (): JSX.Element => {
  const data = useLoader();

  return <ScholaisticFramePage src={data.embedSrc} />;
};

export default ScholaisticAssessmentView;
