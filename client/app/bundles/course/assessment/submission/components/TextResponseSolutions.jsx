import { FormattedMessage } from 'react-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { questionShape } from '../propTypes';
import translations from '../translations';

function renderTextResponseSolutions(question) {
  return (
    <>
      <hr />
      <h4>
        <FormattedMessage {...translations.solutions} />
      </h4>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage {...translations.type} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...translations.solution} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...translations.grade} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {question.solutions.map((solution) => (
            <TableRow key={solution.id}>
              <TableCell>{solution.solutionType}</TableCell>
              <TableCell style={{ whiteSpace: 'pre-wrap' }}>
                {solution.solution}
              </TableCell>
              <TableCell>{solution.grade}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function renderTextResponseComprehensionPoint(point) {
  return (
    <>
      <br />
      <h5>
        <FormattedMessage {...translations.point} />
      </h5>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <FormattedMessage {...translations.pointGrade} />
            </TableCell>
            <TableCell>{point.pointGrade}</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell>
              <FormattedMessage {...translations.type} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...translations.solution} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...translations.solutionLemma} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...translations.information} />
            </TableCell>
          </TableRow>
          {point.solutions.map((solution) => (
            <TableRow key={solution.id}>
              <TableCell>
                <FormattedMessage {...translations[solution.solutionType]} />
              </TableCell>
              <TableCell style={{ whiteSpace: 'pre-wrap' }}>
                {solution.solution}
              </TableCell>
              <TableCell style={{ whiteSpace: 'pre-wrap' }}>
                {solution.solutionLemma}
              </TableCell>
              <TableCell style={{ whiteSpace: 'pre-wrap' }}>
                {solution.information}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function renderTextResponseComprehensionGroup(group) {
  return (
    <>
      <br />
      <h4>
        <FormattedMessage {...translations.group} />
      </h4>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <FormattedMessage {...translations.maximumGroupGrade} />
            </TableCell>
            <TableCell>{group.maximumGroupGrade}</TableCell>
            <TableCell />
            <TableCell />
          </TableRow>
          {group.points.map((point) => (
            <TableRow key={point.id}>
              <TableCell colSpan={4}>
                {renderTextResponseComprehensionPoint(point)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function renderTextResponseComprehension(question) {
  return (
    <>
      <hr />
      <h4>
        <FormattedMessage
          {...translations.solutionsWithMaximumGrade}
          values={{ maximumGrade: question.maximumGrade }}
        />
      </h4>
      {question.groups.map((group) => (
        <div key={group.id}>{renderTextResponseComprehensionGroup(group)}</div>
      ))}
    </>
  );
}

function SolutionsTable({ question }) {
  if (question.comprehension && question.groups) {
    return renderTextResponseComprehension(question);
  }
  if (!question.comprehension && question.solutions) {
    return renderTextResponseSolutions(question);
  }
  return null;
}

SolutionsTable.propTypes = {
  question: questionShape,
};

export default SolutionsTable;
