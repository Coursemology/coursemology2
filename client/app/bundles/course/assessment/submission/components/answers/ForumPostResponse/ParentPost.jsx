import React from 'react';
import ForumPost from 'course/forum/components/ForumPost';
import { forumPostShape } from 'course/assessment/submission/propTypes';
import Labels from './Labels';

const styles = {
  replyPost: {
    marginLeft: 42,
    marginTop: 12,
  },
  subtext: {
    color: '#aaa',
  },
};

function ParentPost({ post }) {
  return (
    <div style={styles.replyPost}>
      <p style={styles.subtext}>Post made in response to:</p>
      <Labels post={post} />
      <ForumPost post={post} replyPost isExpandable />
    </div>
  );
}

ParentPost.propTypes = {
  post: forumPostShape,
};

export default ParentPost;
