import { defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';

import style from '../Discussion.scss';

const translations = defineMessages({
  comment: {
    id: 'course.video.submission.DiscussionElements.Editor.comment',
    defaultMessage: 'Comment',
  },
  cancel: {
    id: 'course.video.submission.DiscussionElements.Editor.cancel',
    defaultMessage: 'Cancel',
  },
  prompt: {
    id: 'course.video.submission.DiscussionElements.Editor.prompt',
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

const Editor = (props) => (
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
          color="secondary"
          disabled={props.disabled}
          onClick={props.onCancel}
          variant="contained"
        >
          {props.cancelButtonText}
        </Button>
      )}
      <Button
        color="primary"
        disabled={props.disabled}
        onClick={props.onSubmit}
        variant="contained"
      >
        {props.submitButtonText}
      </Button>
    </div>
    <div className="clear-both" />
  </>
);

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;

export default Editor;
