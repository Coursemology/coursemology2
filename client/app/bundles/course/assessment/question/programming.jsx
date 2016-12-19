import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import createStore from './programming/store';
import ProgrammingQuestion from './programming/containers/ProgrammingQuestion';

const renderProgrammingQuestion = (props) => {
  const store = createStore(props);

  render(
    <Provider store={store}>
      <ProgrammingQuestion />
    </Provider>
    , $('#programming-question')[0]
  );
};

$.getJSON('', (data) => {
  $(document).ready(() => {
    renderProgrammingQuestion(data);
  });
});
