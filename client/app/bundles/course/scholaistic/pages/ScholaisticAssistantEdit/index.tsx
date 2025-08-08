import { withScholaisticAsyncContainer } from 'course/scholaistic/components/ScholaisticAsyncContainer';
import ScholaisticFramePage from 'course/scholaistic/components/ScholaisticFramePage';

import { useLoader } from './loader';

const ScholaisticAssistantEdit = (): JSX.Element => {
  const data = useLoader();

  return <ScholaisticFramePage src={data.embedSrc} />;
};

export default withScholaisticAsyncContainer(ScholaisticAssistantEdit);
