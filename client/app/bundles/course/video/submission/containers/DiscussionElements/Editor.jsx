import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import CKEditorRichText from 'lib/components/CKEditorRichText';

import style from '../Discussion.scss';

const translations = defineMessages({
  comment: {
    id: 'course.video.DiscussionElements.Editor.commentDefault',
    defaultMessage: 'Comment',
  },
  cancel: {
    id: 'course.video.DiscussionElements.Editor.cancelDefault',
    defaultMessage: 'Cancel',
  },
  prompt: {
    id: 'course.video.DiscussionElements.Editor.prompt',
    defaultMessage: 'Enter your comment here',
  },
});

const propTypes = {
  content: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  showCancel: PropTypes.bool,
  cancelButtonText: PropTypes.node,
  submitButtonText: PropTypes.node,
  children: PropTypes.element,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onContentUpdate: PropTypes.func,
};

const defaultProps = {
  disabled: false,
  showCancel: true,
  cancelButtonText: <FormattedMessage {...translations.cancel} />,
  submitButtonText: <FormattedMessage {...translations.comment} />,
};

function Editor(props) {
  return (
    <>
      <CKEditorRichText
        disabled={props.disabled}
        label={<FormattedMessage {...translations.prompt} />}
        onChange={(nextValue) => props.onContentUpdate(nextValue)}
        value={props.content}
      />
      <div className={style.editorExtraElement}>{props.children}</div>
      <div className={style.editorButtons}>
        {props.showCancel && (
          <Button
            className="mr-4"
            variant="contained"
            color="secondary"
            disabled={props.disabled}
            onClick={props.onCancel}
          >
            {props.cancelButtonText}
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          disabled={props.disabled}
          onClick={props.onSubmit}
        >
          {props.submitButtonText}
        </Button>
      </div>
      <div className="clear-both" />
    </>
  );
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;

export default Editor;
