import { render } from 'react-dom';

import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './store';
import PersonalizedTimelineSettings from './pages/PersonalizedTimelineSettings';

$(() => {
  const mountNode = document.getElementById('personalized-timeline-settings');

  if (mountNode) {
    const data = mountNode.getAttribute('data');
    const attributes = JSON.parse(data);
    const store = storeCreator({
      admin: {
        personalizedTimelineSettings: {
          minOverallLimit: parseFloat(attributes.min_overall_limit),
          maxOverallLimit: parseFloat(attributes.max_overall_limit),
          hardMinLearningRate: attributes.hard_min_learning_rate
            ? parseFloat(attributes.hard_min_learning_rate)
            : null,
          hardMaxLearningRate: attributes.hard_max_learning_rate
            ? parseFloat(attributes.hard_max_learning_rate)
            : null,
          assessmentGradeWeight: parseFloat(attributes.assessment_grade_weight),
          assessmentSubmissionTimeWeight: parseFloat(
            attributes.assessment_submission_time_weight,
          ),
          videoWatchPercentageWeight: parseFloat(
            attributes.video_watch_percentage_weight,
          ),
          earliestOpenAt: attributes.earliest_open_at
            ? new Date(attributes.earliest_open_at)
            : null,
          latestEndAt: attributes.latest_end_at
            ? new Date(attributes.latest_end_at)
            : null,
          isFetching: false,
          isFetchError: false,
          learningRateRecords: [],
        },
      },
    });

    render(
      <ProviderWrapper store={store}>
        <PersonalizedTimelineSettings />
      </ProviderWrapper>,
      mountNode,
    );
  }
});
