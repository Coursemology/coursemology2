import React from "react";

import {getForumTopicURL, getForumURL} from "lib/helpers/url-builders";
import Labels from "course/assessment/submission/components/answers/ForumPostResponse/Labels";
import ForumPost from "course/forum/components/ForumPost";
import ParentPost from "course/assessment/submission/components/answers/ForumPostResponse/ParentPost";
import {getCourseId} from "lib/helpers/url-helpers";
import {postPackShape} from "course/assessment/submission/propTypes";
import PropTypes from "prop-types";

const styles = {
    label: {
        border: '1px solid #B0BEC5',
        padding: '5px 16px',
        backgroundColor: '#F9FBE7',
        cursor: 'pointer',
    },
    trashIcon: {
        color: '#C2185B',
        cursor: 'pointer',
    },
}

export default class SelectedPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isExpanded: false,
        };
    }

    handleTogglePostView() {
        this.setState(oldState => ({
            isExpanded: !oldState.isExpanded,
        }));
    }

    renderTrashIcon() {
        return (
            <div className="pull-right">
                {
                    !this.props.readOnly &&
                    <i className="fa fa-trash"
                       style={styles.trashIcon}
                       onClick={() => this.props.onRemovePostpack()}
                    />
                }
            </div>
        );
    }

    renderLink(url, name){
        return (
          <a href={url} target="_blank" rel="noreferrer" onClick={() => this.handleTogglePostView()}>
              {name} <i className="fa fa-external-link"/>
          </a>
        );
    }

    renderLabel() {
        const postpack = this.props.postpack;
        const courseId = getCourseId();
        const forum = postpack.forum;
        const topic = postpack.topic;

        if (postpack.topic.isDeleted) {
            return (<>Post made under a topic which was subsequently deleted.</>);
        }

        return (
            <>
                <i className={this.state.isExpanded ? "fa fa-angle-down" : "fa fa-angle-right"}
                   style={{width: 20}}
                />
                Post made under {
                    this.renderLink(getForumTopicURL(courseId, forum.id, topic.id), topic.title)
                } in {
                    this.renderLink(getForumURL(courseId, forum.id), forum.name)
                }
            </>
        );
    }

    render() {
        const postpack = this.props.postpack;

        return (
            <>
                <div style={styles.label} onClick={() => this.handleTogglePostView()}>
                    {this.renderLabel()}
                    {this.renderTrashIcon()}
                </div>
                {
                    this.state.isExpanded &&
                    <>
                        <Labels post={postpack.corePost}/>
                        <ForumPost post={postpack.corePost}/>
                        {postpack.parentPost && <ParentPost post={postpack.parentPost}/>}
                    </>
                }
                <br/>
            </>
        );
    }
}

SelectedPost.propTypes = {
    postpack: postPackShape,
    readOnly: PropTypes.bool,
    onRemovePostpack: PropTypes.func,
};
