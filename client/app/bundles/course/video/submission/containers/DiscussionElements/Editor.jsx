import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';

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

const Editor = (props) => (
  <>
    <MaterialSummernote
      airMode={true}
      disabled={props.disabled}
      label={<FormattedMessage {...translations.prompt} />}
      onChange={(nextValue) => props.onContentUpdate(nextValue)}
      value={props.content}
    />
    <div className={style.editorExtraElement}>{props.children}</div>
    <div className={style.editorButtons}>
      {props.showCancel && (
        <RaisedButton
          disabled={props.disabled}
          label={props.cancelButtonText}
          onClick={props.onCancel}
        />
      )}
      <RaisedButton
        disabled={props.disabled}
        label={props.submitButtonText}
        onClick={props.onSubmit}
        primary={true}
      />
    </div>
    <div style={{ clear: 'both' }} />
  </>
);

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;

export default Editor;
