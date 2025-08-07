import { defer, LoaderFunction, useAsyncValue } from 'react-router-dom';
import { ScholaisticAssistantEditData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';
import { setAsyncHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = async ({ params }) =>
  defer({
    promise: (async (): Promise<ScholaisticAssistantEditData> => {
      const promise = CourseAPI.scholaistic.fetchAssistant(params.assistantId!);

      setAsyncHandle(
        promise.then(({ data }) => ({
          assistant: data.display.assistantTitle,
        })),
      );

      return (await promise).data;
    })(),
  });

export const useLoader = (): ScholaisticAssistantEditData =>
  useAsyncValue() as ScholaisticAssistantEditData;
