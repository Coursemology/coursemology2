import { useState } from 'react';
import { produce } from 'immer';
import {
  BasicMetadata,
  ProgrammingFormData,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import translations from '../../translations';

import buildFormData from './commons/builder';
import { create, fetchEdit, fetchNew, update } from './operations';
import ProgrammingForm from './ProgrammingForm';
import { useLocation } from 'react-router-dom';

const NewProgrammingQuestionPage = (): JSX.Element => {
  const [id, setId] = useState<number>();
  const [persisted, setPersisted] = useState(false);
  const location = useLocation();

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

  const loadPrefilledData = (data: ProgrammingFormData) => {
    const prefilledData = location.state;
    if (prefilledData) {
      data.question.title = prefilledData?.question?.title;
      data.question.description = prefilledData?.question?.description;
      data.question.languageId = prefilledData?.question?.languageId;
      // set question to autograded if it includes at least one test case
      data.question.autograded = prefilledData?.testUi?.metadata?.testCases?.public?.length > 0 || prefilledData?.testUi?.metadata?.testCases?.private?.length > 0 || prefilledData?.testUi?.metadata?.testCases?.evaluation?.length > 0
      const prefilledMetadata: BasicMetadata = {
        solution: prefilledData?.testUi?.metadata?.solution,
        submission: prefilledData?.testUi?.metadata?.submission,
        prepend: '',
        append: '',
        dataFiles: [],
        testCases: {
          public: prefilledData?.testUi?.metadata?.testCases?.public,
          private: prefilledData?.testUi?.metadata?.testCases?.private,
          evaluation: prefilledData?.testUi?.metadata?.testCases?.evaluation,
        },
      }
      if (data.testUi) {
        data.testUi.metadata = Object.assign(data.testUi.metadata, prefilledMetadata);
      } else {
        data.testUi = { metadata: prefilledMetadata, mode: data.languages.find(lang => lang.id === prefilledData.question.languageId)!.editorMode };
      }
    }
    console.log({ state: location.state, data, prefilledData });
    return data;
  }

  return (
    <Preload render={<LoadingIndicator />} while={fetchNew}>
      {(data): JSX.Element => (
        <ProgrammingForm
          dirty={!persisted}
          onSubmit={createOrUpdate}
          revalidate={mergeNewImportResult}
          with={loadPrefilledData(data)}
        />
      )}
    </Preload>
  );
};

const handle = translations.newProgramming;

export default Object.assign(NewProgrammingQuestionPage, { handle });
