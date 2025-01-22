import { ReactNode, useLayoutEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography } from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import Hint from 'lib/components/core/Hint';
import Section from 'lib/components/core/layouts/Section';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

export const CODE_INSERTS_ID = 'code-inserts';

export interface PackageEditorProps {
  disabled?: boolean;
}

interface ContainerProps {
  children: ReactNode;
}

interface TestCasesProps extends ContainerProps {
  hint?: ReactNode;
}

const Templates = (props: ContainerProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Section sticksToNavbar title={t(translations.templates)}>
      {props.children}
    </Section>
  );
};

const CodeInserts = (props: ContainerProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Section
      id={CODE_INSERTS_ID}
      sticksToNavbar
      subtitle={t(translations.codeInsertsHint)}
      title={t(translations.codeInserts)}
    >
      {props.children}
    </Section>
  );
};

const DataFiles = (props: ContainerProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Section sticksToNavbar title={t(translations.dataFiles)}>
      {props.children}
    </Section>
  );
};

const AutoFocusOnLoad = (props: ContainerProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const positionX = ref.current?.offsetTop;
    if (!positionX) return;

    window.scrollTo({ top: positionX, behavior: 'smooth' });
  }, []);

  return <div ref={ref}>{props.children}</div>;
};

const TestCasesTemplate = (props: TestCasesProps): JSX.Element => {
  const { t } = useTranslation();

  const { formState } = useFormContext<ProgrammingFormData>();
  const testCasesError = formState.errors.testUi?.metadata?.testCases?.message;

  return (
    <Section sticksToNavbar title={t(translations.testCases)}>
      {props.hint && (
        <Hint
          contentClassName="space-y-5"
          hideText={t(translations.hideExplanation)}
          initiallyShown
          showText={t(translations.showTestCasesExplanation)}
        >
          {props.hint}
        </Hint>
      )}

      {testCasesError && (
        <AutoFocusOnLoad>
          <Typography color="error" variant="body2">
            {testCasesError}
          </Typography>
        </AutoFocusOnLoad>
      )}

      {props.children}
    </Section>
  );
};

const PackageEditor = { Templates, CodeInserts, DataFiles, TestCasesTemplate };

export default PackageEditor;
