import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Button } from '@mui/material';

import axios from 'lib/axios';

interface Props extends WrappedComponentProps {
  accessButtonText: string;
  accessButtonLink: string;
  submissionUrl: string;
  isVideo: boolean;
  isNewAttempt: boolean;
}

const TodoAccessButton: FC<Props> = (props) => {
  const {
    accessButtonText,
    accessButtonLink,
    submissionUrl,
    isVideo,
    isNewAttempt,
  } = props;
  return (
    <Button
      color="primary"
      onClick={(): void => {
        // TODO: Refactor below to remove if else check
        if (isVideo) {
          axios.get(accessButtonLink).then((response) => {
            window.location.href = `${submissionUrl}/${response.data.submissionId}/edit`;
          });
        } else if (isNewAttempt) {
          axios.get(accessButtonLink).then((response) => {
            window.location.href = response.data.redirectUrl;
          });
        } else {
          window.location.href = accessButtonLink;
        }
      }}
      style={{ width: 80 }}
      variant="contained"
    >
      {accessButtonText}
    </Button>
  );
};

export default injectIntl(TodoAccessButton);
