import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { ScholaisticAssistantsIndexData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';

export const loader: LoaderFunction =
  async (): Promise<ScholaisticAssistantsIndexData> => {
    const { data } = await CourseAPI.scholaistic.fetchAssistants();

    return data;
  };

export const useLoader = (): ScholaisticAssistantsIndexData =>
  useLoaderData() as ScholaisticAssistantsIndexData;
