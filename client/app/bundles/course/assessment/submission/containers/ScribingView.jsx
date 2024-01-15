import { connect } from 'react-redux';

import * as actions from '../actions/answers/scribing';
import ScribingViewComponent from '../components/ScribingView';

const ScribingViewContainer = (props) => <ScribingViewComponent {...props} />;

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { answerId } = ownProps;
  return {
    scribing: submission.scribing[answerId],
    submission: submission.submission,
  };
}

const ScribingView = connect(mapStateToProps, actions)(ScribingViewContainer);
export default ScribingView;
