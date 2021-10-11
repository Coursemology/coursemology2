import React from 'react';
import PropTypes from 'prop-types';
import {Field} from 'redux-form';
import RichTextField from 'lib/components/redux-form/RichTextField';

import CourseAPI from 'api/course';
import {questionShape} from '../../../propTypes';
import ForumPost from "../../../../../forum/components/ForumPost";
import ParentPost from "./ParentPost";
import Labels from "./Labels";
import PostSelector from "./PostSelector";

const styles = {
    label: {
        border: '1px solid #B0BEC5',
        borderBottom: 0,
        padding: '5px 16px',
    },
    labelSelected: {
        backgroundColor: '#F9FBE7',
    },
}

export default class ForumPostResponse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            qtyPostsSelected: 0,
            maxPosts: this.props.question.max_posts,
            selectedPosts: [],
        };
    }

    componentDidMount() {
        CourseAPI.forums.getAllPosts()
            .then((response) => response.data)
            .then((data) => {
                this.setState({...data});
            })
        // TODO: handle errors
    }

    handlePostSelection = () => {

    }

    renderTextAnswer() {
        const readOnlyAnswer = (
            <Field
                name={`${this.props.answerId}[answer_text]`}
                component={(props) => (
                    <div dangerouslySetInnerHTML={{__html: props.input.value}}/>
                )}
            />
        );

        const richtextAnswer = (
            <Field
                name={`${this.props.answerId}[answer_text]`}
                component={RichTextField}
                multiLine
            />
        );

        return (
            <div>
                {this.props.readOnly ? readOnlyAnswer : richtextAnswer}
            </div>
        );
    }

    renderActive() {
        const posts = this.state.selectedPosts;

        return (
            <div>
                <div style={{fontSize: 15}}>
                    Select {this.props.question.max_posts > 1 && 'up to '}
                    <b>{this.props.question.max_posts} forum {this.props.question.max_posts > 1 ? 'posts' : 'post'}</b>.
                    You have selected&nbsp;
                    {this.state.qtyPostsSelected} {this.state.qtyPostsSelected > 1 ? 'posts' : 'post'}.
                </div>
                <br />
                <PostSelector question={this.props.question}
                              forumTopicPosts={this.state.forumTopicPosts}
                              onPostSelection={this.handlePostSelection}
                />
                <br />
                {
                    posts.map((post) => (
                        <ForumPost text={post.text}
                                   userName={post.userName}
                                   avatar={post.avatar}
                                   createdAt={post.createdAt}
                                   key={post.id}
                        />
                    ))
                }
                <br />
                {this.props.question.has_text_response && this.renderTextAnswer()}
            </div>
        );
    }

    renderReadOnly() {
        const post = dummyPost
        return (
            <div>
                <div style={{...styles.label, ...styles.labelSelected}}>
                    Post made under&nbsp;
                    <a href={`/courses/4/forums/${post.forum.id}/topics/${post.topic.id}`}
                       target="_blank"
                       rel="noreferrer">
                        {post.topic.title} <i className="fa fa-external-link" aria-hidden="true" />
                    </a>&nbsp;
                    in&nbsp;
                    <a href={`/courses/4/forums/${post.forum.id}`}
                       target="_blank"
                       rel="noreferrer">
                        {post.forum.name} <i className="fa fa-external-link" aria-hidden="true" />
                    </a>
                </div>
                {post.status && <Labels status={post.status}/>}
                <ForumPost text={post.text}
                           userName={post.userName}
                           avatar={post.avatar}
                           createdAt={post.createdAt}
                />
                {post.parent && <ParentPost parent={post.parent}/>}
                <br />
                {this.props.question.has_text_response && this.renderTextAnswer()}
            </div>
        );
    }

    render() {
        return (
            this.props.readOnly ? this.renderReadOnly() : this.renderActive()
        );
    }
}

ForumPostResponse.propTypes = {
    question: questionShape,
    readOnly: PropTypes.bool,
    answerId: PropTypes.number,
};
