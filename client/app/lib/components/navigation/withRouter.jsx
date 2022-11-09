import { useParams } from 'react-router-dom';

export default function withRouter(Child) {
  const WithRouterInner = (props) => {
    const params = useParams();
    return <Child {...props} match={{ params }} />;
  };
  return WithRouterInner;
}
