import { Button } from '@mui/material';

import Link from 'lib/components/core/Link';

interface TodoAccessButtonProps {
  accessButtonText: string;
  accessButtonLink: string;
}

const TodoAccessButton = (props: TodoAccessButtonProps): JSX.Element => {
  const { accessButtonText, accessButtonLink } = props;

  return (
    <Link to={accessButtonLink}>
      <Button color="primary" size="small" variant="contained">
        {accessButtonText}
      </Button>
    </Link>
  );
};

export default TodoAccessButton;
