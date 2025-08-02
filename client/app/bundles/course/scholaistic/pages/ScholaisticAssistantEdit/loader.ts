import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { ScholaisticAssistantEditData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';
import { setHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = async ({
  params,
}): Promise<ScholaisticAssistantEditData> => {
  const { data } = await CourseAPI.scholaistic.fetchAssistant(
    params.assistantId!,
  );

  setHandle('assistant', data.display.assistantTitle);

  return data;
};

export const useLoader = (): ScholaisticAssistantEditData =>
  useLoaderData() as ScholaisticAssistantEditData;
