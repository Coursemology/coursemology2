import React from "react";
import PropTypes from "prop-types";
import ForumPost from "../../../../../forum/components/ForumPost";
import Labels from "./Labels";

const styles = {
    replyPost: {
        marginLeft: 42,
        marginTop: 12,
    },
    subtext: {
        color: '#aaa',
    },
}

function ParentPost({parent}) {
    return (
        <div style={styles.replyPost}>
            <p style={styles.subtext}>
                <i>post made in response to:</i>
            </p>
            {parent.status && <Labels status={parent.status}/>}
            <ForumPost text={parent.text}
                       userName={parent.userName}
                       avatar={parent.avatar}
                       createdAt={parent.createdAt}
                       replyPost/>
        </div>
    )
}

ParentPost.propTypes = {
    parent: PropTypes.object,
};

export default ParentPost;
