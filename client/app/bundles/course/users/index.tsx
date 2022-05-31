import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import UsersIndex from './pages/UsersIndex';
import configureStore from './store';

$(() => {
  console.log('users poke');
  const mountNode = document.getElementById('course-users-component');
  console.log('users index poke');

  if (mountNode) {
    const store = configureStore();

    console.log('users index mounted');

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
            <Route path="/courses/:courseId/users/" element={<UsersIndex />} />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
