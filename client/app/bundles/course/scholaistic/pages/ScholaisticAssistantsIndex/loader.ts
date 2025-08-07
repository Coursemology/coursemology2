import { defer, LoaderFunction, useAsyncValue } from 'react-router-dom';
import { ScholaisticAssistantsIndexData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';

export const loader: LoaderFunction = () =>
  defer({
    promise: (async (): Promise<ScholaisticAssistantsIndexData> => {
      const { data } = await CourseAPI.scholaistic.fetchAssistants();

      return data;
    })(),
  });

export const useLoader = (): ScholaisticAssistantsIndexData =>
  useAsyncValue() as ScholaisticAssistantsIndexData;
