import ScribingView from '../../../containers/ScribingView';
import type { ScribingAnswerProps } from '../types';

const ScribingAdapter = (props: ScribingAnswerProps): JSX.Element => {
  const { question, answerId } = props;
  return <ScribingView key={`question_${question.id}`} answerId={answerId!} />;
};

export default ScribingAdapter;
