import Section from 'lib/components/core/layouts/Section';
import Subsection from 'lib/components/core/layouts/Subsection';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';

export const BUILD_LOG_ID = 'build-log' as const;

const BuildLog = (): JSX.Element | null => {
  const { importResult } = useProgrammingFormDataContext();

  const { t } = useTranslation();

  const buildLog = importResult?.buildLog;
  if (!buildLog) return null;

  return (
    <Section
      id={BUILD_LOG_ID}
      sticksToNavbar
      subtitle={t(translations.buildLogHint)}
      title={t(translations.buildLog)}
    >
      <Subsection title={t(translations.standardError)}>
        <pre>{buildLog.stderr}</pre>
      </Subsection>

      <Subsection className="!mt-10" title={t(translations.standardOutput)}>
        <pre>{buildLog.stdout}</pre>
      </Subsection>
    </Section>
  );
};

export default BuildLog;
