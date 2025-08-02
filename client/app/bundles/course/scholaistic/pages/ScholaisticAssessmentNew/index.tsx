import { defineMessage } from 'react-intl';

import ScholaisticFramePage from 'course/scholaistic/components/ScholaisticFramePage';

import { useLoader } from './loader';

const ScholaisticAssessmentNew = (): JSX.Element => {
  const data = useLoader();

  return <ScholaisticFramePage src={data.embedSrc} />;
};

export const handle = defineMessage({ defaultMessage: 'New' });

export default ScholaisticAssessmentNew;
