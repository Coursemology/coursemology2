import { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';

import TitleBar from 'lib/components/navigation/TitleBar';

interface Props {
  title: ReactNode | string;
  returnLink?: string;
  toolbars?: ReactNode;
  children?: ReactNode;
}

const PageHeader: FC<Props> = (props) => {
  const { title, returnLink, toolbars, children } = props;
  const navigate = useNavigate();

  return (
    <TitleBar
      data-testid="TitleBar"
      iconElementLeft={
        returnLink ? (
          <IconButton
            data-testid="ArrowBackIconButton"
            onClick={(): void => navigate(returnLink)}
          >
            <ArrowBack data-testid="ArrowBack" htmlColor="white" />
          </IconButton>
        ) : null
      }
      iconElementRight={children ?? toolbars ?? null}
      title={title}
    />
  );
};

export default PageHeader;
