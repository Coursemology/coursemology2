import React from 'react';
import PropTypes from 'prop-types';

import CourseAPI from 'api/course';
import Snackbar from 'material-ui/Snackbar';
import SelectedPost from "course/assessment/submission/components/answers/ForumPostResponse/SelectedPost";
import {questionShape} from '../../../propTypes';

import PostSelector from "./PostSelector";
import Error from "./Error";

const styles = {
    label: {
        border: '1px solid #B0BEC5',
        borderBottom: 0,
        padding: '5px 16px',
    },
    labelSelected: {
        backgroundColor: '#F9FBE7',
    },
    postCounter: {
        display: 'inline-block',
        fontSize: 15,
        padding: '5px 20px',
        marginBottom: 10,
        borderRadius: 20,
        background: '#CFD8DC',
    },
    trashIcon: {
        // fontSize: 18,
        color: '#C2185B',
    },
}

export default class ForumPostResponseField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showSnackbar: false,
            hasErrorFetchingPosts: false,
            hasErrorFetchingSelectedPostpacks: false,
        };
    }

    componentDidMount() {
        CourseAPI.assessment.answer.forumPostResponse.fetchPosts()
            .then((response) => response.data)
            .then((data) => {
                this.setState({...data});
            })
            .catch(() => {
                this.setState({hasErrorFetchingPosts: true});
            });

        CourseAPI.assessment.answer.forumPostResponse.fetchSelectedPostpacks(this.props.answerId)
            .then((response) => response.data)
            .then((data) => {
                this.props.input.onChange(data.selected_postpacks);
            })
            .catch(() => {
                this.setState({hasErrorFetchingSelectedPostpacks: true});
            });
    }

    handlePostpackSelection(postpack, isSelected) {
        if (this.props.readOnly) {
            return;
        }

        const postpacks = this.props.input.value
        if (!this.props.readOnly) {
            if (!isSelected) {
                if (postpacks.length >= this.props.question.max_posts) {
                    // Error if max posts have already been selected
                    this.setState({showSnackbar: true});
                } else {
                    this.props.input.onChange([...postpacks, postpack]);
                }
            } else {
                this.handleRemovePostpack(postpack);
            }
        }
    }

    handleRequestCloseSnackbar = () => {
        this.setState({
            showSnackbar: false,
        });
    };

    handleRemovePostpack(postpack) {
        if (this.props.readOnly) {
            return;
        }

        const postpacks = this.props.input.value
        const selectedPostpacks = [...postpacks];
        let matchedIndex = -1;
        selectedPostpacks.forEach((selectedPostpack, index) => {
            if (selectedPostpack.corePost.id === postpack.corePost.id) {
                matchedIndex = index
            }
        })
        if (matchedIndex !== -1) {
            selectedPostpacks.splice(matchedIndex, 1);
        }
        this.props.input.onChange(selectedPostpacks);
    }

    renderSelectedPostpacks(postpacks) {
        return (
            postpacks && postpacks.map((postpack) => (
                <div key={postpack.corePost.id}>
                    <SelectedPost postpack={postpack}
                                  readOnly={this.props.readOnly}
                                  onRemovePostpack={() => this.handleRemovePostpack(postpack)}
                    />
                </div>
            ))
        );
    }

    render() {
        const postpacks = this.props.input.value;
        const maxPosts = this.props.question.max_posts;

        return (
            <div>
                <div style={{fontSize: 15}}>
                    Select {maxPosts > 1 && 'up to'} <b>{maxPosts} forum {maxPosts > 1 ? 'posts' : 'post'}</b>.
                    You have selected {postpacks.length} {postpacks.length > 1 ? 'posts' : 'post'}.
                </div>
                <br/>
                {
                    !this.props.readOnly &&
                    <>
                        <PostSelector maxPosts={this.props.question.max_posts}
                                      forumTopicPostpacks={this.state.forumTopicPostpacks}
                                      selectedPostIds={postpacks && postpacks.map(postpack => postpack.corePost.id)}
                                      onSelectPostpack={
                                          (postpackSelected, isSelected) =>
                                              this.handlePostpackSelection(postpackSelected, isSelected)
                                      }
                                      hasError={this.state.hasErrorFetchingPosts}
                        />
                        <br/><br/>
                    </>
                }
                {
                    this.state.hasErrorFetchingSelectedPostpacks
                        ?
                        <Error
                            message="Oops! Unable to retrieve your selected posts. Please try refreshing this page."/>
                        :
                        this.renderSelectedPostpacks(postpacks)
                }
                <br/>

                <Snackbar
                    open={this.state.showSnackbar}
                    message="Unable to select post, as you have selected the max no. of posts allowed."
                    autoHideDuration={4000}
                    onRequestClose={this.handleRequestCloseSnackbar}
                />
            </div>
        );
    }
}

ForumPostResponseField.propTypes = {
    question: questionShape,
    answerId: PropTypes.number,
    readOnly: PropTypes.bool,
    input: PropTypes.object,
};
