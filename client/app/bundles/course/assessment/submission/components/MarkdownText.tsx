import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';

interface MarkdownTextProps {
  content: string;
}

const MarkdownText: FC<MarkdownTextProps> = (props) => {
  const { content } = props;

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <Typography className="p-1" variant="body2">
            {children}
          </Typography>
        ),
        li: ({ children }) => (
          <Typography component="li" variant="body2">
            {children}
          </Typography>
        ),
        ul: ({ children }) => <ul>{children}</ul>,
        a: ({ children, href }) => (
          <Link external href={href} opensInNewTab>
            {children}
          </Link>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownText;
