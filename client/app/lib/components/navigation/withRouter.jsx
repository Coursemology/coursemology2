import { useParams } from 'react-router-dom';

export default function withRouter(Child) {
  // eslint-disable-next-line react/display-name
  return (props) => {
    const params = useParams();
    return <Child {...props} match={{ params }} />;
  };
}
