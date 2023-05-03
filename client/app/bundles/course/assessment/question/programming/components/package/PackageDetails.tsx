import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';
import { useProgrammingFormDataContext } from '../../hooks/ProgrammingFormDataContext';
import Accordion from '../common/Accordion';
import StaticTestCase from '../common/StaticTestCase';
import TestCases from '../common/TestCases';

import PackageEditor from './PackageEditor';

interface PackageDetailsProps {
  disabled?: boolean;
}

const PackageDetails = (props: PackageDetailsProps): JSX.Element | null => {
  const { t } = useTranslation();

  const { question, packageUi } = useProgrammingFormDataContext();
  if (!question.package) return null;

  const { templates, testCases } = packageUi;

  return (
    <>
      <PackageEditor.Templates>
        {templates.map((template) => (
          <Accordion
            key={template.id}
            disabled={props.disabled}
            title={template.filename}
          >
            <section
              className="-mb-5 px-5 pt-2"
              dangerouslySetInnerHTML={{ __html: template.content }}
            />
          </Accordion>
        ))}
      </PackageEditor.Templates>

      <PackageEditor.TestCases>
        <TestCases
          as={StaticTestCase}
          byIdentifier={(index: number): string =>
            testCases.public[index].identifier
          }
          disabled={props.disabled}
          name="packageUi.testCases.public"
          static
          title={t(translations.publicTestCases)}
        />

        <TestCases
          as={StaticTestCase}
          byIdentifier={(index: number): string =>
            testCases.private[index].identifier
          }
          disabled={props.disabled}
          name="packageUi.testCases.private"
          static
          subtitle={t(translations.privateTestCasesHint)}
          title={t(translations.privateTestCases)}
        />

        <TestCases
          as={StaticTestCase}
          byIdentifier={(index: number): string =>
            testCases.evaluation[index].identifier
          }
          disabled={props.disabled}
          name="packageUi.testCases.evaluation"
          static
          subtitle={t(translations.evaluationTestCasesHint)}
          title={t(translations.evaluationTestCases)}
        />
      </PackageEditor.TestCases>
    </>
  );
};

export default PackageDetails;
