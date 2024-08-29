import { useState } from 'react';
import { produce } from 'immer';
import {
  ProgrammingFormData,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import translations from '../../translations';

import buildFormData from './commons/builder';
import { create, fetchEdit, fetchNew, update } from './operations';
import ProgrammingForm from './ProgrammingForm';

const NewProgrammingQuestionPage = (): JSX.Element => {
  const [id, setId] = useState<number>();
  const [persisted, setPersisted] = useState(false);

  const createOrUpdate = (
    rawData: ProgrammingFormData,
  ): Promise<ProgrammingPostStatusData> => {
    const formData = buildFormData(rawData);

    if (id) {
      setPersisted(true);
      return update(id, formData);
    }

    return create(formData);
  };

  const mergeNewImportResult = async (
    response: ProgrammingPostStatusData,
    rawData: ProgrammingFormData,
  ): Promise<ProgrammingFormData> => {
    const newId = id ?? response.id;

    if (!newId)
      throw new Error(`NewProgrammingQuestionPage received ID: ${newId}.`);

    setId(newId);

    const newData = await fetchEdit(newId);
    return produce(rawData, (draft) => {
      delete draft.question.package;
      draft.importResult = newData.importResult;

      if (newData.question.package?.path) {
        draft.question.package = newData.question.package;
      } else {
        delete draft.question.package;
      }
    });
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchNew}>
      {(data: ProgrammingFormData): JSX.Element => (
        <ProgrammingForm
          dirty={!persisted}
          onSubmit={createOrUpdate}
          revalidate={mergeNewImportResult}
          with={data}
        />
      )}
    </Preload>
  );
};

const handle = translations.newProgramming;

export default Object.assign(NewProgrammingQuestionPage, { handle });
