import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import AssessmentStatisticsPage from './pages/AssessmentStatistics';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('assessment-statistics');
  if (mountNode) {
    const dataAttr = mountNode.getAttribute('data');
    const data = JSON.parse(dataAttr);
    const store = storeCreator({});
    const assessmentId = data.assessment_id;

    const Page = () => (
      <ProviderWrapper store={store}>
        <AssessmentStatisticsPage assessmentId={assessmentId} />
      </ProviderWrapper>
    );
    render(<Page />, mountNode);
  }
});
