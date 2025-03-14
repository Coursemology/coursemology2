import { UseFormSetValue } from 'react-hook-form';
import { DropResult } from '@hello-pangea/dnd';
import { AxiosError } from 'axios';
import {
  JavaMetadataTestCase,
  LanguageData,
  MetadataTestCase,
  MetadataTestCases,
  PackageImportResultData,
  ProgrammingFormData,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';
import { CodaveriGenerateResponse } from 'types/course/assessment/question-generation';

import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/jobHelpers';

const EVALUATION_INTERVAL_MS = 500 as const;

const ProgrammingAPI = CourseAPI.assessment.question.programming;

export const fetchCodaveriLanguages = async (): Promise<LanguageData[]> => {
  const response = await ProgrammingAPI.fetchCodaveriLanguages();
  return response.data;
};

export const fetchNew = async (): Promise<ProgrammingFormData> => {
  const response = await ProgrammingAPI.fetchNew();
  return response.data;
};

export const fetchEdit = async (id: number): Promise<ProgrammingFormData> => {
  const response = await ProgrammingAPI.fetchEdit(id);
  return response.data;
};

export const fetchImportResult = async (
  id: number,
): Promise<PackageImportResultData> => {
  const response = await ProgrammingAPI.fetchImportResult(id);
  return response.data.importResult;
};

export const create = async (
  data: FormData,
): Promise<ProgrammingPostStatusData> => {
  try {
    const response = await ProgrammingAPI.create(data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors);

    throw error;
  }
};

export const update = async (
  id: number,
  data: FormData,
): Promise<ProgrammingPostStatusData> => {
  try {
    const response = await ProgrammingAPI.update(id, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors);

    throw error;
  }
};

export const generate = async (
  data: FormData,
): Promise<CodaveriGenerateResponse> => {
  try {
    const response = await ProgrammingAPI.generate(data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors);

    throw error;
  }
};

export const watchEvaluation = (
  url: string,
  onSuccess: () => void,
  onError: (message: string) => void,
): void =>
  pollJob(
    url,
    onSuccess,
    (error) => onError(error.message),
    EVALUATION_INTERVAL_MS,
  );

export const rearrangeTestCases = (
  result: DropResult,
  testCases:
    | MetadataTestCases<MetadataTestCase>
    | MetadataTestCases<JavaMetadataTestCase>,
  setValue: UseFormSetValue<ProgrammingFormData>,
): void => {
  const { source, destination } = result;
  if (!destination) return;

  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  const updatedTestCases = { ...testCases };

  const sourceArray = [...updatedTestCases[source.droppableId]];
  const destinationArray =
    source.droppableId === destination.droppableId
      ? sourceArray
      : [...updatedTestCases[destination.droppableId]];

  const [reorderedTestCase] = sourceArray.splice(source.index, 1);

  destinationArray.splice(destination.index, 0, reorderedTestCase);

  updatedTestCases[source.droppableId] = sourceArray;
  updatedTestCases[destination.droppableId] = destinationArray;

  setValue('testUi.metadata.testCases', updatedTestCases, {
    shouldDirty: true,
  });
};

export const deleteTestCase = (
  testCases:
    | MetadataTestCases<MetadataTestCase>
    | MetadataTestCases<JavaMetadataTestCase>,
  setValue: UseFormSetValue<ProgrammingFormData>,
  index: number,
  name: string,
): void => {
  const type = name.split('.').pop();
  const updatedTestCases = { ...testCases };

  const targetedArray = [...updatedTestCases[type!]];
  targetedArray.splice(index, 1);

  updatedTestCases[type!] = targetedArray;

  setValue('testUi.metadata.testCases', updatedTestCases, {
    shouldDirty: true,
  });
};
