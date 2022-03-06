import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import MaterialSummernote from 'lib/components/MaterialSummernote';

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
      <MaterialSummernote
        airMode
        disabled={props.disabled}
        label={<FormattedMessage {...translations.prompt} />}
        onChange={(nextValue) => props.onContentUpdate(nextValue)}
        value={props.content}
      />
      <div className={style.editorExtraElement}>{props.children}</div>
      <div className={style.editorButtons}>
        {props.showCancel && (
          <RaisedButton
            label={props.cancelButtonText}
            onClick={props.onCancel}
            disabled={props.disabled}
          />
        )}
        <RaisedButton
          label={props.submitButtonText}
          primary
          onClick={props.onSubmit}
          disabled={props.disabled}
        />
      </div>
      <div style={{ clear: 'both' }} />
    </>
  );
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;

export default Editor;
