import React from 'react';

import ForumPost from 'course/forum/components/ForumPost';
import { forumPostShape } from 'course/assessment/submission/propTypes';

import Labels from './Labels';

const styles = {
  parentPost: {
    marginLeft: 42,
    marginTop: 12,
  },
  subtext: {
    color: '#aaa',
  },
  post: {
    border: '1px dashed #ddd',
    opacity: 0.8,
  },
};

function ParentPost({ post }) {
  return (
    <div style={styles.parentPost}>
      <p style={styles.subtext}>Post made in response to:</p>
      <Labels post={post} />
      <ForumPost post={post} isExpandable style={styles.post} />
    </div>
  );
}

ParentPost.propTypes = {
  post: forumPostShape,
};

export default ParentPost;
