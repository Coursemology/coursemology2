import { defineMessage } from 'react-intl';

import { withScholaisticAsyncContainer } from 'course/scholaistic/components/ScholaisticAsyncContainer';
import ScholaisticFramePage from 'course/scholaistic/components/ScholaisticFramePage';

import { useLoader } from './loader';

const ScholaisticAssistantsIndex = (): JSX.Element => {
  const data = useLoader();

  return <ScholaisticFramePage src={data.embedSrc} />;
};

export const handle = defineMessage({ defaultMessage: 'Assistants' });

export default withScholaisticAsyncContainer(ScholaisticAssistantsIndex);
