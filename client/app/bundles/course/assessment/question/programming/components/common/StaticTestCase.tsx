import { useWatch } from 'react-hook-form';
import { Typography } from '@mui/material';

import ExpandableCode from 'lib/components/core/ExpandableCode';

import { ReorderableTestCaseProps } from './ReorderableTestCase';
import TestCaseCell from './TestCaseCell';
import TestCaseRow from './TestCaseRow';

interface StaticTestCaseProps extends ReorderableTestCaseProps {
  id?: string;
}

const StaticTestCase = (props: StaticTestCaseProps): JSX.Element => {
  const testCase = useWatch({ control: props.control, name: props.name });

  return (
    <TestCaseRow header={props.id}>
      <TestCaseCell.Expression className="w-1/3">
        <ExpandableCode>{testCase.expression}</ExpandableCode>
      </TestCaseCell.Expression>

      <TestCaseCell.Expected className="w-1/3">
        <ExpandableCode>{testCase.expected}</ExpandableCode>
      </TestCaseCell.Expected>

      <TestCaseCell.Hint className="w-1/3">
        <Typography className="h-full" variant="body2">
          {testCase.hint}
        </Typography>
      </TestCaseCell.Hint>
    </TestCaseRow>
  );
};
export default StaticTestCase;
