import React from "react";
import ForumPost from "../../../../../forum/components/ForumPost";
import Labels from "./Labels";
import {forumPostShape} from "course/assessment/submission/propTypes";

const styles = {
    replyPost: {
        marginLeft: 42,
        marginTop: 12,
    },
    subtext: {
        color: '#aaa',
    },
}

function ParentPost({post}) {
    return (
        <div style={styles.replyPost}>
            <p style={styles.subtext}>
                <i>post made in response to:</i>
            </p>
            <Labels post={post}/>
            <ForumPost post={post} replyPost isExpandable/>
        </div>
    )
}

ParentPost.propTypes = {
    post: forumPostShape,
};

export default ParentPost;
