import { injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { Button } from '@mui/material';
import axios from 'lib/axios';

interface Props extends WrappedComponentProps {
  accessButtonText: string;
  accessButtonLink: string;
  isVideo: boolean;
}

const TodoAccessButton: FC<Props> = (props) => {
  const { accessButtonText, accessButtonLink, isVideo } = props;
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={(): void => {
        if (isVideo) {
          axios
            .post(accessButtonLink)
            .then((response) => {
              window.location.href = `${accessButtonLink}/${response.data.submissionId}/edit`;
            })
            .catch((_e) => {});
        } else {
          window.location.href = accessButtonLink;
        }
      }}
      style={{ marginRight: 10, width: 100 }}
    >
      {accessButtonText}
    </Button>
  );
};

export default injectIntl(TodoAccessButton);
