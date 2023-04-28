import { useWatch } from 'react-hook-form';
import { Typography } from '@mui/material';

import Expandable from '../../../../../../../lib/components/core/Expandable';

import { TestCaseProps } from './TestCase';
import TestCaseCell from './TestCaseCell';
import TestCaseRow from './TestCaseRow';

const StaticTestCase = (props: TestCaseProps): JSX.Element => {
  const testCase = useWatch({ control: props.control, name: props.name });

  return (
    <TestCaseRow header={props.id}>
      <TestCaseCell.Expression className="w-1/3">
        <Expandable over={40}>
          <Typography
            className="h-full break-all font-mono text-[1.3rem]"
            variant="body2"
          >
            {testCase.expression}
          </Typography>
        </Expandable>
      </TestCaseCell.Expression>

      <TestCaseCell.Expected className="w-1/3">
        <Expandable over={40}>
          <Typography
            className="h-full break-all font-mono text-[1.3rem]"
            variant="body2"
          >
            {testCase.expected}
          </Typography>
        </Expandable>
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
