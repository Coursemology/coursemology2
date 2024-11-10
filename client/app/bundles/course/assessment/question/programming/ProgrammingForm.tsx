import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ProgrammingFormData,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';

import Section from 'lib/components/core/layouts/Section';
import Form, { FormEmitter } from 'lib/components/form/Form';
import { loadingToast } from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import schema, { isPackageFieldsDirty } from './commons/validation';
import BuildLog from './components/sections/BuildLog';
import EvaluatorFields from './components/sections/EvaluatorFields';
import FeedbackFields from './components/sections/FeedbackFields';
import LanguageFields from './components/sections/LanguageFields';
import PackageFields, {
  PACKAGE_SECTION_ID,
} from './components/sections/PackageFields';
import QuestionFields from './components/sections/QuestionFields';
import SubmitWarningDialog from './components/sections/SubmitWarningDialog';
import { ProgrammingFormDataProvider } from './hooks/ProgrammingFormDataContext';
import useLanguageMode from './hooks/useLanguageMode';
import { watchEvaluation } from './operations';

interface ProgrammingFormProps {
  with: ProgrammingFormData;
  dirty?: boolean;
  onSubmit?: (data: ProgrammingFormData) => Promise<ProgrammingPostStatusData>;
  revalidate?: (
    response: ProgrammingPostStatusData,
    data: ProgrammingFormData,
  ) => Promise<ProgrammingFormData>;
}

const ProgrammingForm = (props: ProgrammingFormProps): JSX.Element => {
  const [data, setData] = useState(props.with);

  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormEmitter<ProgrammingFormData>>();
  const [pending, setPending] = useState<() => void>();

  const { languageOptions, getDataFromId } = useLanguageMode(data.languages);

  const navigate = useNavigate();

  const submitForm = async (rawData: ProgrammingFormData): Promise<void> => {
    if (!props.onSubmit) return undefined;

    setSubmitting(true);

    const toast = loadingToast(t(translations.savingChanges));

    try {
      const response = await props.onSubmit(rawData);

      const toastSuccessAndRedirect = (): void => {
        toast.success(t(translations.questionSavedRedirecting));
        navigate(response.redirectAssessmentUrl);
      };

      if (!response.importJobUrl) return toastSuccessAndRedirect();

      toast.update(t(translations.evaluatingSubmissions));

      let debounced = false;

      return watchEvaluation(
        response.importJobUrl,
        () => {
          if (debounced) return;
          debounced = true;

          toastSuccessAndRedirect();
        },
        async () => {
          if (debounced) return;
          debounced = true;

          const newData = await props.revalidate?.(response, rawData);
          if (newData) {
            setData(newData);
            form?.resetTo?.(newData, true);
          }

          toast.error(t(translations.questionSavedButPackageError));

          setSubmitting(false);
          window.location.href = `#${PACKAGE_SECTION_ID}`;
        },
      );
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      toast.error(error.message || t(translations.errorWhenSavingQuestion));
      return setSubmitting(false);
    }
  };

  const preProcessForm = (draft: ProgrammingFormData): ProgrammingFormData => {
    if (draft.testUi?.mode) {
      draft.testUi.mode = getDataFromId(draft.question.languageId)?.editorMode;
    }

    return draft;
  };

  return (
    <ProgrammingFormDataProvider from={data}>
      <Form
        contextual
        dirty={props.dirty}
        disabled={submitting}
        emitsVia={setForm}
        headsUp
        initialValues={data}
        onSubmit={(rawData): void => {
          if (
            data.question.hasSubmissions &&
            isPackageFieldsDirty(data, rawData)
          ) {
            setPending(() => () => submitForm(rawData));
          } else {
            submitForm(rawData);
          }
        }}
        transformsBy={preProcessForm}
        validates={schema(t)}
        validatesWith={{ getDataFromId }}
      >
        <QuestionFields disabled={submitting} />

        <Section sticksToNavbar title={t(translations.languageAndEvaluation)}>
          <LanguageFields
            disabled={submitting}
            getDataFromId={getDataFromId}
            languageOptions={languageOptions}
          />

          <EvaluatorFields
            disabled={submitting}
            getDataFromId={getDataFromId}
          />
        </Section>

        <PackageFields disabled={submitting} getDataFromId={getDataFromId} />

        <FeedbackFields disabled={submitting} getDataFromId={getDataFromId} />

        <BuildLog />
      </Form>

      <SubmitWarningDialog
        onClose={(): void => setPending(undefined)}
        onConfirm={(): void => pending?.()}
        open={Boolean(pending)}
      />
    </ProgrammingFormDataProvider>
  );
};

export default ProgrammingForm;
