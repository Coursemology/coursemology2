import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import { questionShape } from '../propTypes';
import translations from '../translations';

function renderTextResponseSolutions(question) {
  return (
    <>
      <hr />
      <h4>
        <FormattedMessage {...translations.solutions} />
      </h4>
      <Table selectable={false}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn>
              <FormattedMessage {...translations.type} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.solution} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.grade} />
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {question.solutions.map((solution) => (
            <TableRow key={solution.id}>
              <TableRowColumn>{solution.solutionType}</TableRowColumn>
              <TableRowColumn style={{ whiteSpace: 'pre-wrap' }}>
                {solution.solution}
              </TableRowColumn>
              <TableRowColumn>{solution.grade}</TableRowColumn>
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
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>
              <FormattedMessage {...translations.pointGrade} />
            </TableRowColumn>
            <TableRowColumn>{point.pointGrade}</TableRowColumn>
            <TableRowColumn />
            <TableRowColumn />
          </TableRow>
          <TableRow>
            <TableHeaderColumn>
              <FormattedMessage {...translations.type} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.solution} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.solutionLemma} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.information} />
            </TableHeaderColumn>
          </TableRow>
          {point.solutions.map((solution) => (
            <TableRow key={solution.id}>
              <TableRowColumn>
                <FormattedMessage {...translations[solution.solutionType]} />
              </TableRowColumn>
              <TableRowColumn style={{ whiteSpace: 'pre-wrap' }}>
                {solution.solution}
              </TableRowColumn>
              <TableRowColumn style={{ whiteSpace: 'pre-wrap' }}>
                {solution.solutionLemma}
              </TableRowColumn>
              <TableRowColumn style={{ whiteSpace: 'pre-wrap' }}>
                {solution.information}
              </TableRowColumn>
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
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>
              <FormattedMessage {...translations.maximumGroupGrade} />
            </TableRowColumn>
            <TableRowColumn>{group.maximumGroupGrade}</TableRowColumn>
            <TableRowColumn />
            <TableRowColumn />
          </TableRow>
          {group.points.map((point) => (
            <TableRow key={point.id}>
              <TableRowColumn colSpan={4}>
                {renderTextResponseComprehensionPoint(point)}
              </TableRowColumn>
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
