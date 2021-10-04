import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import TextResponseAnswer from './TextResponse';
import RichTextField from 'lib/components/redux-form/RichTextField';

import { questionShape } from '../../propTypes';

function ForumPostResponse({ question, readOnly, answerId, graderView }) {
    const readOnlyAnswer = (
        <Field
            name={`${answerId}[answer_text]`}
            component={(props) => (
                <div dangerouslySetInnerHTML={{ __html: props.input.value }} />
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
            <p>{answerId}</p>

        </div>
    );
}

ForumPostResponse.propTypes = {
    question: questionShape,
    readOnly: PropTypes.bool,
    answerId: PropTypes.number,
    graderView: PropTypes.bool,
    input: PropTypes.shape({
        value: PropTypes.string,
    }),
};

export default ForumPostResponse;
