import React from 'react';
import PropTypes from 'prop-types';
import {Field} from 'redux-form';
import RichTextField from 'lib/components/redux-form/RichTextField';

import {questionShape} from '../../propTypes';

function renderForumPostSelector() {
    // TODO
}

function renderTextAnswer({readOnly, answerId}) {
    const readOnlyAnswer = (
        <Field
            name={`${answerId}[answer_text]`}
            component={(props) => (
                <div dangerouslySetInnerHTML={{__html: props.input.value}}/>
            )}
        />
    );

    const richtextAnswer = (
        <Field
            name={`${answerId}[answer_text]`}
            component={RichTextField}
            multiLine
        />
    );

    return (
        <div>
            {readOnly ? readOnlyAnswer : richtextAnswer}
        </div>
    );
}

function ForumPostResponse({question, readOnly, answerId}) {
    return (
        <div>
            {renderForumPostSelector()}
            {question.has_text_response && renderTextAnswer({readOnly, answerId})}
        </div>
    );
}

ForumPostResponse.propTypes = {
    question: questionShape,
    readOnly: PropTypes.bool,
    answerId: PropTypes.number,
    input: PropTypes.shape({
        value: PropTypes.string,
    }),
};

export default ForumPostResponse;
