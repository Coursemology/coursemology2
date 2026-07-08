import { useParams } from 'react-router-dom';
import {
  TextResponseEditableFormData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import BaseAPI from 'api/Base';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import TextResponseForm from './components/TextResponseForm';
import { fetchEdit, update } from './operations';

const api = new BaseAPI();

interface SpreadsheetFileEntry {
  id: string;
  name: string;
  url: string;
  file: File | null;
}

const EditTextResponsePage = (): JSX.Element => {
  const { t } = useTranslation();

  const params = useParams();
  const id = parseInt(params?.questionId ?? '', 10) || undefined;
  if (!id) throw new Error(`EditTextResponseForm was loaded with ID: ${id}.`);

  const fetchSpreadsheetFileEntry = async (
    solutionId: string,
    name: string,
    url: string,
  ): Promise<SpreadsheetFileEntry> => {
    const result: SpreadsheetFileEntry = {
      id: solutionId,
      name,
      url,
      file: null,
    };
    const { data: blob } = await api.client.get<Blob>(url, {
      responseType: 'blob',
      params: { format: undefined },
    });
    result.file = new File([blob], name ?? 'spreadsheet', {
      type: blob.type,
    });
    return result;
  };

  const fetchData = async (): Promise<TextResponseFormData> => {
    const questionData = await fetchEdit(id);
    const fileEntriesToFetch = (questionData.solutions ?? [])
      .map((solution) => {
        if (!solution.spreadsheet?.file?.url?.length) {
          return null;
        }
        return fetchSpreadsheetFileEntry(
          String(solution.id),
          solution.spreadsheet.file.name,
          solution.spreadsheet.file.url,
        );
      })
      .filter((value) => value !== null);

    const fetchedFiles = (await Promise.allSettled(fileEntriesToFetch))
      .map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return null;
      })
      .filter((value): value is SpreadsheetFileEntry => value !== null);
    const fetchedFilesMapper: Record<
      string,
      Omit<SpreadsheetFileEntry, 'id'>
    > = Object.fromEntries(
      fetchedFiles.map(({ id: solutionId, ...rest }) => [solutionId, rest]),
    );

    (questionData.solutions ?? []).forEach((solution) => {
      if (solution.id in fetchedFilesMapper && solution.spreadsheet) {
        solution.spreadsheet.file = fetchedFilesMapper[solution.id];
      }
    });
    return questionData;
  };
  const handleSubmit = (data: TextResponseEditableFormData): Promise<void> =>
    update(id, data).then(({ redirectUrl }) => {
      toast.success(t(formTranslations.changesSaved));
      window.location.href = redirectUrl;
    });

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => {
        return <TextResponseForm onSubmit={handleSubmit} with={data} />;
      }}
    </Preload>
  );
};

export default EditTextResponsePage;
