import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { enableMapSet } from 'immer';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import EditVoicePage from './voice-responses/EditVoicePage';
import NewVoicePage from './voice-responses/NewVoicePage';

enableMapSet();

$(() => {
  const mountNode = document.getElementById('app-root');
  if (!mountNode) return;

  const root = createRoot(mountNode);
  root.render(
    <ProviderWrapper>
      <BrowserRouter>
        <Routes>
          <Route
            element={<NewVoicePage />}
            path="courses/:courseId/assessments/:assessmentId/question/voice_responses/new"
          />

          <Route
            element={<EditVoicePage />}
            path="/courses/:courseId/assessments/:assessmentId/question/voice_responses/:questionId/edit"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
