import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import ReactSummernote from 'react-summernote';
import RaisedButton from 'material-ui/RaisedButton';

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

const editorOptions = {
  airMode: true,
  dialogsInBody: false,
  popover: {
    air: [
      ['style', ['style']],
      ['font', ['bold', 'underline', 'clear']],
      ['script', ['superscript', 'subscript']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['table', ['table']],
      ['insert', ['link', 'picture']],
    ],
  },
};

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
    <div>
      <ReactSummernote
        options={Object.assign({}, editorOptions, { disabled: props.disabled })}
        value={props.content}
        onChange={props.onContentUpdate}
      />
      <div className={style.editorExtraElement}>
        {props.children}
      </div>
      <div className={style.editorButtons}>
        {props.showCancel && (
          <RaisedButton
            label={props.cancelButtonText}
            onClick={props.onCancel}
          />
        )}
        <RaisedButton
          label={props.submitButtonText}
          primary
          onClick={props.onSubmit}
        />
      </div>
      <div style={{ clear: 'both' }} />
    </div>
  );
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;

export default Editor;
