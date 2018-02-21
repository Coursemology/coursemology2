import React, { Component } from 'react';

import ProgrammingAnswerHistory from '../containers/ProgrammingAnswerHistory';

// Abstraction layer for future answer history components of different answer types
export default class AnswersHistory extends Component {
  static renderProgramming(question) {
    return (
      <ProgrammingAnswerHistory question={question} />
    );
  }
}
