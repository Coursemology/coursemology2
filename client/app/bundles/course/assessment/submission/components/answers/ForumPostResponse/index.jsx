import {Field} from "redux-form";
import React from "react";
import PropTypes from "prop-types";
import RichTextField from 'lib/components/redux-form/RichTextField';
import ForumPostResponseField from "./ForumPostResponseField";
import {questionShape} from "../../../propTypes";


function renderTextField(readOnly, answerId) {
    return (
        <>
            {
                readOnly ?
                    <Field
                        name={`${answerId}[answer_text]`}
                        component={(props) => (
                            <div dangerouslySetInnerHTML={{__html: props.input.value}}/>
                        )}
                    /> : <Field
                        name={`${answerId}[answer_text]`}
                        component={RichTextField}
                        multiLine
                    />
            }
        </>
    );
}

function ForumPostResponse({question, readOnly, answerId}) {
    return (
        <>
            <Field
                name={`${answerId}[selected_postpacks]`}
                component={ForumPostResponseField}
                {...{question, readOnly, answerId}}
            />
            {question.has_text_response && renderTextField(readOnly, answerId)}
        </>
    );
}

ForumPostResponse.propTypes = {
    question: questionShape,
    readOnly: PropTypes.bool,
    answerId: PropTypes.number,
};

export default ForumPostResponse;
