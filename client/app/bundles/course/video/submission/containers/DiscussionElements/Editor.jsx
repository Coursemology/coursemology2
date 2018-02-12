import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

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
  cancelButtonText: (<FormattedMessage {...translations.cancel} />),
  submitButtonText: (<FormattedMessage {...translations.comment} />),
};

function Editor(props) {
  return (
    <React.Fragment>
      <TextField
        fullWidth
        multiLine
        floatingLabelText="Enter your comment here"
        rows={2}
        rowsMax={4}
        value={props.content}
        onChange={event => props.onContentUpdate(event.target.value)}
      />
      <div className={style.editorExtraElement}>
        {props.children}
      </div>
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
    </React.Fragment>
  );
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;

export default Editor;
