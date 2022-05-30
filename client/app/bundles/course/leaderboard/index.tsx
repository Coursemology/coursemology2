import { render } from 'react-dom';
// import { BrowserRouter, Routes } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('course-leaderboard-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <p>test</p>
      </ProviderWrapper>
      ,
      mountNode,
    );
  }
});

{/*  */}
