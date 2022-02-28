import React, { Component } from 'react';
import { Field } from 'redux-form';
import PropTypes from 'prop-types';

import { questionShape } from 'course/assessment/submission/propTypes';
import NotificationBar from 'lib/components/NotificationBar';
import RichTextField from 'lib/components/redux-form/RichTextField';
import Error from 'lib/components/ErrorCard';

import ForumPostSelect from './ForumPostSelect';

function renderTextField(readOnly, answerId) {
  return readOnly ? (
    <Field
      name={`${answerId}[answer_text]`}
      component={(props) => (
        <div dangerouslySetInnerHTML={{ __html: props.input.value }} />
      )}
    />
  ) : (
    <Field
      name={`${answerId}[answer_text]`}
      component={RichTextField}
      multiline
    />
  );
}

class ForumPostResponse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: '',
      notificationMessage: '',
    };
  }

  render() {
    const { question, readOnly, answerId } = this.props;
    return (
      <>
        <Field
          name={`${answerId}[selected_post_packs]`}
          component={ForumPostSelect}
          question={question}
          readOnly={readOnly}
          answerId={answerId}
          onErrorMessage={(message) =>
            this.setState({
              errorMessage: message,
            })
          }
          handleNotificationMessage={(message) =>
            this.setState({
              notificationMessage: message,
            })
          }
        />
        {question.hasTextResponse && renderTextField(readOnly, answerId)}
        {this.state.errorMessage && <Error message={this.state.errorMessage} />}
        <NotificationBar
          open={this.state.notificationMessage !== ''}
          notification={{ message: this.state.notificationMessage }}
          autoHideDuration={4000}
          onClose={() => this.setState({ notificationMessage: '' })}
        />
      </>
    );
  }
}

ForumPostResponse.propTypes = {
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  answerId: PropTypes.number.isRequired,
};

export default ForumPostResponse;
