import { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { questionShape } from 'course/assessment/submission/propTypes';
import NotificationBar from 'lib/components/NotificationBar';
import RichTextField from 'lib/components/redux-form/RichTextField';

import Error from './Error';
import ForumPostSelect from './ForumPostSelect';

function renderTextField(readOnly, answerId) {
  return readOnly ? (
    <Field
      component={(props) => (
        <div dangerouslySetInnerHTML={{ __html: props.input.value }} />
      )}
      name={`${answerId}[answer_text]`}
    />
  ) : (
    <Field
      component={RichTextField}
      multiLine={true}
      name={`${answerId}[answer_text]`}
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
          answerId={answerId}
          component={ForumPostSelect}
          handleNotificationMessage={(message) =>
            this.setState({
              notificationMessage: message,
            })
          }
          name={`${answerId}[selected_post_packs]`}
          onErrorMessage={(message) =>
            this.setState({
              errorMessage: message,
            })
          }
          question={question}
          readOnly={readOnly}
        />
        {question.hasTextResponse && renderTextField(readOnly, answerId)}
        {this.state.errorMessage && <Error message={this.state.errorMessage} />}
        <NotificationBar
          autoHideDuration={4000}
          notification={{ message: this.state.notificationMessage }}
          onRequestClose={() => this.setState({ notificationMessage: '' })}
          open={this.state.notificationMessage !== ''}
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
