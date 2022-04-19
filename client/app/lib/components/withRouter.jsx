import { useParams } from 'react-router-dom';

export default function withRouter(Child) {
  return function withRouterInner(props) {
    const params = useParams();
    return <Child {...props} match={{ params }} />;
  };
}
